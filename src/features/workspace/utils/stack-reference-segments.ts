import { diff_match_patch, DIFF_DELETE, DIFF_EQUAL, DIFF_INSERT } from 'diff-match-patch'
import { tokenizeInStacks } from './tokenize-tibetan-stacks'

export type ReferenceSegment =
  | { type: 'default'; text: string }
  | { type: 'highlight'; text: string }

function encodeTokenPair(
  tokensLeft: string[],
  tokensRight: string[]
): { left: string; right: string; vocab: string[] } {
  const vocab: string[] = ['']
  const indexByToken = new Map<string, number>()

  function codeFor(token: string): number {
    let code = indexByToken.get(token)
    if (code === undefined) {
      code = vocab.length
      if (code > 0xffff) {
        throw new Error('Too many unique stack tokens to diff')
      }
      indexByToken.set(token, code)
      vocab.push(token)
    }
    return code
  }

  const left = tokensLeft.map((token) => String.fromCharCode(codeFor(token))).join('')
  const right = tokensRight.map((token) => String.fromCharCode(codeFor(token))).join('')

  return { left, right, vocab }
}

function decodeTokens(encoded: string, vocab: string[]): string {
  let text = ''
  for (let i = 0; i < encoded.length; i++) {
    text += vocab[encoded.charCodeAt(i)] ?? ''
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

  const anchorTokens = tokenizeInStacks(anchorText)
  if (anchorTokens.length === 0) return startPos

  const haystackTokens = tokenizeInStacks(text.slice(startPos))
  for (let i = 0; i <= haystackTokens.length - anchorTokens.length; i++) {
    let matches = true
    for (let j = 0; j < anchorTokens.length; j++) {
      if (haystackTokens[i + j] !== anchorTokens[j]) {
        matches = false
        break
      }
    }
    if (matches) {
      return charOffsetForTokenIndex(haystackTokens, i, startPos)
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
  const tokensReviewer = tokenizeInStacks(reviewerSuffix)
  const tokensExpected = tokenizeInStacks(expected)
  const { left, right, vocab } = encodeTokenPair(tokensReviewer, tokensExpected)
  const dmp = new diff_match_patch()
  const diffs = dmp.diff_main(left, right, false)
  dmp.diff_cleanupSemantic(diffs)

  const segments: ReferenceSegment[] = []
  let reviewerTokensConsumed = 0
  let expectedTokensConsumed = 0
  const totalExpected = tokensExpected.length

  for (const [op, encoded] of diffs) {
    if (expectedTokensConsumed >= totalExpected) break
    if (!encoded) continue

    const tokenCount = encoded.length
    const chunkText = decodeTokens(encoded, vocab)

    if (op === DIFF_EQUAL) {
      pushSegment(segments, 'default', chunkText)
      reviewerTokensConsumed += tokenCount
      expectedTokensConsumed += tokenCount
      continue
    }

    if (op === DIFF_DELETE) {
      pushSegment(segments, 'highlight', chunkText)
      reviewerTokensConsumed += tokenCount
      continue
    }

    if (op === DIFF_INSERT) {
      expectedTokensConsumed += tokenCount
    }
  }

  return {
    segments,
    endPos: charOffsetForTokenIndex(tokensReviewer, reviewerTokensConsumed, startPos),
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
  const tokensValue = tokenizeInStacks(value)
  const tokensOther = tokenizeInStacks(otherValue)
  const [tokensLeft, tokensRight] = isPrimarySlot
    ? [tokensValue, tokensOther]
    : [tokensOther, tokensValue]

  const { left, right, vocab } = encodeTokenPair(tokensLeft, tokensRight)
  const dmp = new diff_match_patch()
  const diffs = dmp.diff_main(left, right, false)
  dmp.diff_cleanupSemantic(diffs)

  const segments: ReferenceSegment[] = []

  for (const [op, encoded] of diffs) {
    if (!encoded) continue

    const text = decodeTokens(encoded, vocab)

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
