export type TextSegment = { type: 'text'; content: string }

export type DiffSegment = {
  type: 'diff'
  id: number
  s1: string
  s2: string
  selected: 's1' | 's2' | null // null = unresolved
}

export type Segment = TextSegment | DiffSegment

/**
 * Splits raw transcript into segments. Each diff starts with selected: null (unresolved).
 */
export function parseTDiff(raw: string): Segment[] {
  if (!raw) return []

  const segments: Segment[] = []
  // Matches <t-diff data='...'></t-diff> or <t-diff data="..."/> (with optional whitespace)
  const regex = /<t-diff\s+data=(['"])(.*?)\1\s*(?:\/>|><\/t-diff>)/g

  let lastIndex = 0
  let match
  let id = 0

  while ((match = regex.exec(raw)) !== null) {
    const matchIndex = match.index
    const matchText = match[0]
    const jsonData = match[2]

    // If there is text before this match, add it as a text segment
    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: raw.substring(lastIndex, matchIndex),
      })
    }

    try {
      // Decode HTML entities if they exist (standard behavior for data-attributes in some HTML parsers)
      const decodedJson = jsonData
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
      
      const parsed = JSON.parse(decodedJson)
      segments.push({
        type: 'diff',
        id: id++,
        s1: parsed.s1 ?? '',
        s2: parsed.s2 ?? '',
        selected: null,
      })
    } catch (e) {
      // If parsing fails, fall back to adding it as a text segment
      segments.push({
        type: 'text',
        content: matchText,
      })
    }

    lastIndex = regex.lastIndex
  }

  // Add any remaining text
  if (lastIndex < raw.length) {
    segments.push({
      type: 'text',
      content: raw.substring(lastIndex),
    })
  }

  return segments
}

/**
 * Compiles segments into clean text using the selected value for each diff.
 * If a diff is unresolved, it falls back to an empty string (or Option A to prevent crash,
 * though submit will be blocked until resolved).
 */
export function resolveSegments(segments: Segment[]): string {
  return segments
    .map((seg) => {
      if (seg.type === 'text') {
        return seg.content
      } else {
        return seg.selected ? seg[seg.selected] : ''
      }
    })
    .join('')
}

/**
 * Returns true only when every diff segment has a non-null selection.
 */
export function allDiffsResolved(segments: Segment[]): boolean {
  return segments.every((seg) => seg.type !== 'diff' || seg.selected !== null)
}

const DIFF_DRAFT_KEY_PREFIX = 'draft_task_diff_'

export function getDiffDraftKey(taskId: string): string {
  return `${DIFF_DRAFT_KEY_PREFIX}${taskId}`
}

export function loadDiffDraftSelections(taskId: string): Record<number, 's1' | 's2' | null> | null {
  try {
    const stored = localStorage.getItem(getDiffDraftKey(taskId))
    if (!stored) return null
    return JSON.parse(stored) as Record<number, 's1' | 's2' | null>
  } catch {
    return null
  }
}

export function saveDiffDraftSelections(
  taskId: string,
  segments: Segment[]
): void {
  const selections = segments.reduce(
    (acc, seg) => {
      if (seg.type === 'diff') {
        acc[seg.id] = seg.selected
      }
      return acc
    },
    {} as Record<number, 's1' | 's2' | null>
  )
  localStorage.setItem(getDiffDraftKey(taskId), JSON.stringify(selections))
}

export function clearDiffDraft(taskId: string): void {
  localStorage.removeItem(getDiffDraftKey(taskId))
}

/**
 * Returns a new segment array with saved diff selections applied immutably.
 */
export function applyDiffSelections(
  segments: Segment[],
  selections: Record<number, 's1' | 's2' | null>
): Segment[] {
  return segments.map((seg) => {
    if (seg.type !== 'diff' || selections[seg.id] === undefined) {
      return seg
    }
    return { ...seg, selected: selections[seg.id] }
  })
}
