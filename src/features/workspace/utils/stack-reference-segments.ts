import { diff_match_patch, DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT } from 'diff-match-patch'
import { tokenizeForStackDiff } from './tokenize-tibetan-stacks'

export type ReferenceSegment =
  | { type: 'default'; text: string }
  | { type: 'highlight'; text: string }

function encodeTokenPair(
  normLeft: string[],
  normRight: string[],
  displayLeft: string[],
  displayRight: string[]
): {
  left: string
  right: string
  displayLeftByCode: string[]
  displayRightByCode: string[]
} {
  const indexByNorm = new Map<string, number>()
  const displayLeftByCode: string[] = ['']
  const displayRightByCode: string[] = ['']

  function codeFor(norm: string, display: string, side: 'left' | 'right'): number {
    let code = indexByNorm.get(norm)
    if (code === undefined) {
      code = displayLeftByCode.length
      if (code > 0xffff) {
        throw new Error('Too many unique stack tokens to diff')
      }
      indexByNorm.set(norm, code)
      displayLeftByCode.push('')
      displayRightByCode.push('')
    }
    if (side === 'left') {
      displayLeftByCode[code] = display
    } else {
      displayRightByCode[code] = display
    }
    return code
  }

  const left = normLeft
    .map((norm, index) =>
      String.fromCharCode(codeFor(norm, displayLeft[index] ?? norm, 'left'))
    )
    .join('')
  const right = normRight
    .map((norm, index) =>
      String.fromCharCode(codeFor(norm, displayRight[index] ?? norm, 'right'))
    )
    .join('')

  return { left, right, displayLeftByCode, displayRightByCode }
}

function decodeTokens(encoded: string, displayByCode: string[]): string {
  let text = ''
  for (let i = 0; i < encoded.length; i++) {
    text += displayByCode[encoded.charCodeAt(i)] ?? ''
  }
  return text
}

export function pushReferenceSegment(
  segments: ReferenceSegment[],
  type: ReferenceSegment['type'],
  text: string
): void {
  if (!text) return
  const last = segments[segments.length - 1]
  if (last && last.type === type) {
    last.text += text
    return
  }
  segments.push({ type, text })
}

function pushSegment(
  segments: ReferenceSegment[],
  type: ReferenceSegment['type'],
  text: string
): void {
  pushReferenceSegment(segments, type, text)
}

function charOffsetForTokenIndex(tokens: string[], tokenIndex: number, baseOffset = 0): number {
  let offset = baseOffset
  for (let i = 0; i < tokenIndex; i++) {
    offset += tokens[i]?.length ?? 0
  }
  return offset
}

/** First stack-aligned occurrence of `anchorText` in `text` at or after `startPos`. */
export function findStackAnchorPosition(
  text: string,
  startPos: number,
  anchorText: string
): number {
  if (!anchorText) return text.length

  const { normTokens: anchorTokens } = tokenizeForStackDiff(anchorText)
  if (anchorTokens.length === 0) return startPos

  const { normTokens: haystackTokens, displayTokens: haystackDisplayTokens } =
    tokenizeForStackDiff(text.slice(startPos))
  for (let i = 0; i <= haystackTokens.length - anchorTokens.length; i++) {
    let matches = true
    for (let j = 0; j < anchorTokens.length; j++) {
      if (haystackTokens[i + j] !== anchorTokens[j]) {
        matches = false
        break
      }
    }
    if (matches) {
      return charOffsetForTokenIndex(haystackDisplayTokens, i, startPos)
    }
  }

  return -1
}

/**
 * Diff reviewer text against an expected ACT plain segment.
 * Stops once the expected text is fully consumed so later `<t-diff>` regions stay separate.
 */
export function diffReviewerPrimaryUntilExpectedConsumed(
  reviewer: string,
  startPos: number,
  expected: string
): { segments: ReferenceSegment[]; endPos: number } {
  if (!expected) {
    return { segments: [], endPos: startPos }
  }

  const reviewerSuffix = reviewer.slice(startPos)
  const reviewerTokens = tokenizeForStackDiff(reviewerSuffix)
  const expectedTokens = tokenizeForStackDiff(expected)
  const { left, right, displayLeftByCode } = encodeTokenPair(
    reviewerTokens.normTokens,
    expectedTokens.normTokens,
    reviewerTokens.displayTokens,
    expectedTokens.displayTokens
  )
  const dmp = new diff_match_patch()
  const diffs = dmp.diff_main(left, right, false)
  dmp.diff_cleanupSemantic(diffs)

  const segments: ReferenceSegment[] = []
  let reviewerTokensConsumed = 0
  let expectedTokensConsumed = 0
  const totalExpected = expectedTokens.normTokens.length

  for (const [op, encoded] of diffs) {
    if (expectedTokensConsumed >= totalExpected) break
    if (!encoded) continue

    const tokenCount = encoded.length

    if (op === DIFF_EQUAL) {
      pushSegment(segments, 'default', decodeTokens(encoded, displayLeftByCode))
      reviewerTokensConsumed += tokenCount
      expectedTokensConsumed += tokenCount
      continue
    }

    if (op === DIFF_DELETE) {
      pushSegment(segments, 'highlight', decodeTokens(encoded, displayLeftByCode))
      reviewerTokensConsumed += tokenCount
      continue
    }

    if (op === DIFF_INSERT) {
      expectedTokensConsumed += tokenCount
    }
  }

  return {
    segments,
    endPos: charOffsetForTokenIndex(
      reviewerTokens.displayTokens,
      reviewerTokensConsumed,
      startPos
    ),
  }
}

/**
 * Diff two transcripts at Tibetan stack boundaries.
 * Primary slot (A): equal plain, delete highlighted.
 * Secondary slot (B): equal plain, insert highlighted.
 */
export function buildStackReferenceSegments(
  value: string,
  otherValue: string,
  isPrimarySlot: boolean
): ReferenceSegment[] {
  const valueTokens = tokenizeForStackDiff(value)
  const otherTokens = tokenizeForStackDiff(otherValue)
  const [leftTokens, rightTokens] = isPrimarySlot
    ? [valueTokens, otherTokens]
    : [otherTokens, valueTokens]

  const { left, right, displayLeftByCode, displayRightByCode } = encodeTokenPair(
    leftTokens.normTokens,
    rightTokens.normTokens,
    leftTokens.displayTokens,
    rightTokens.displayTokens
  )
  const dmp = new diff_match_patch()
  const diffs = dmp.diff_main(left, right, false)
  dmp.diff_cleanupSemantic(diffs)

  const segments: ReferenceSegment[] = []
  const displayByCode = isPrimarySlot ? displayLeftByCode : displayRightByCode

  for (const [op, encoded] of diffs) {
    if (!encoded) continue

    const text = decodeTokens(encoded, displayByCode)

    if (op === DIFF_EQUAL) {
      pushSegment(segments, 'default', text)
      continue
    }

    if (isPrimarySlot && op === DIFF_DELETE) {
      pushSegment(segments, 'highlight', text)
      continue
    }

    if (!isPrimarySlot && op === DIFF_INSERT) {
      pushSegment(segments, 'highlight', text)
    }
  }

  return segments
}
