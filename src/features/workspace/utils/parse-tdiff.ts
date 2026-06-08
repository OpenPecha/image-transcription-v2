export type TextSegment = { type: 'text'; content: string }

export type DiffSelection =
  | { kind: 'preset'; index: number }
  | { kind: 'custom'; value: string }

export type DiffSegment = {
  type: 'diff'
  id: number
  options: string[]
  selected: DiffSelection | null
  customDraft: string
}

export type Segment = TextSegment | DiffSegment

function extractOptionsFromParsed(parsed: Record<string, unknown>): string[] {
  return Object.keys(parsed)
    .filter((key) => /^s\d+$/.test(key))
    .sort((a, b) => Number(a.slice(1)) - Number(b.slice(1)))
    .map((key) => String(parsed[key] ?? ''))
}

export function getDiffResolvedValue(seg: DiffSegment): string {
  if (!seg.selected) return ''
  if (seg.selected.kind === 'preset') {
    return seg.options[seg.selected.index] ?? ''
  }
  return seg.selected.value
}

export function isDiffResolved(seg: DiffSegment): boolean {
  if (!seg.selected) return false
  if (seg.selected.kind === 'custom') {
    return seg.selected.value.trim().length > 0
  }
  return (
    seg.selected.index >= 0 &&
    seg.selected.index < seg.options.length &&
    seg.options[seg.selected.index] !== undefined
  )
}

/**
 * Splits raw transcript into segments. Each diff starts with selected: null (unresolved).
 */
export function parseTDiff(raw: string): Segment[] {
  if (!raw) return []

  const segments: Segment[] = []
  const regex = /<t-diff\s+data=(['"])(.*?)\1\s*(?:\/>|><\/t-diff>)/g

  let lastIndex = 0
  let match
  let id = 0

  while ((match = regex.exec(raw)) !== null) {
    const matchIndex = match.index
    const matchText = match[0]
    const jsonData = match[2]

    if (matchIndex > lastIndex) {
      segments.push({
        type: 'text',
        content: raw.substring(lastIndex, matchIndex),
      })
    }

    try {
      const decodedJson = jsonData
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')

      const parsed = JSON.parse(decodedJson) as Record<string, unknown>
      segments.push({
        type: 'diff',
        id: id++,
        options: extractOptionsFromParsed(parsed),
        selected: null,
        customDraft: '',
      })
    } catch {
      segments.push({
        type: 'text',
        content: matchText,
      })
    }

    lastIndex = regex.lastIndex
  }

  if (lastIndex < raw.length) {
    segments.push({
      type: 'text',
      content: raw.substring(lastIndex),
    })
  }

  return segments
}

export function resolveSegments(segments: Segment[]): string {
  return segments
    .map((seg) => {
      if (seg.type === 'text') {
        return seg.content
      }
      return isDiffResolved(seg) ? getDiffResolvedValue(seg) : ''
    })
    .join('')
}

export function allDiffsResolved(segments: Segment[]): boolean {
  return segments.every((seg) => seg.type !== 'diff' || isDiffResolved(seg))
}

const DIFF_DRAFT_KEY_PREFIX = 'draft_task_diff_'

export function getDiffDraftKey(taskId: string): string {
  return `${DIFF_DRAFT_KEY_PREFIX}${taskId}`
}

type LegacyDraftSelection = 's1' | 's2' | null

type StoredDiffDraft =
  | LegacyDraftSelection
  | DiffSelection
  | null
  | {
      selected: DiffSelection | null
      customDraft?: string
    }

type DiffDraftEntry = {
  selected: DiffSelection | null
  customDraft: string
}

function normalizeDraftSelection(value: unknown): DiffSelection | null {
  if (value === null || value === undefined) return null
  if (value === 's1') return { kind: 'preset', index: 0 }
  if (value === 's2') return { kind: 'preset', index: 1 }
  if (typeof value !== 'object') return null

  const record = value as Record<string, unknown>
  if ('selected' in record) {
    return normalizeDraftSelection(record.selected)
  }

  const selection = value as Partial<DiffSelection>
  if (selection.kind === 'preset' && typeof selection.index === 'number') {
    return { kind: 'preset', index: selection.index }
  }
  if (selection.kind === 'custom' && typeof selection.value === 'string') {
    return { kind: 'custom', value: selection.value }
  }
  return null
}

function normalizeDraftEntry(value: unknown): DiffDraftEntry {
  const selected = normalizeDraftSelection(value)
  if (value !== null && typeof value === 'object' && 'selected' in value) {
    const record = value as { selected: unknown; customDraft?: unknown }
    const customDraft =
      typeof record.customDraft === 'string'
        ? record.customDraft
        : selected?.kind === 'custom'
          ? selected.value
          : ''
    return { selected, customDraft }
  }

  return {
    selected,
    customDraft: selected?.kind === 'custom' ? selected.value : '',
  }
}

export function loadDiffDraftSelections(
  taskId: string
): Record<number, DiffDraftEntry> | null {
  try {
    const stored = localStorage.getItem(getDiffDraftKey(taskId))
    if (!stored) return null

    const parsed = JSON.parse(stored) as Record<string, StoredDiffDraft>
    const drafts: Record<number, DiffDraftEntry> = {}

    for (const [key, value] of Object.entries(parsed)) {
      drafts[Number(key)] = normalizeDraftEntry(value)
    }

    return drafts
  } catch {
    return null
  }
}

export function saveDiffDraftSelections(taskId: string, segments: Segment[]): void {
  const drafts = segments.reduce(
    (acc, seg) => {
      if (seg.type === 'diff') {
        acc[seg.id] = {
          selected: seg.selected,
          customDraft: seg.customDraft,
        }
      }
      return acc
    },
    {} as Record<number, DiffDraftEntry>
  )
  localStorage.setItem(getDiffDraftKey(taskId), JSON.stringify(drafts))
}

export function clearDiffDraft(taskId: string): void {
  localStorage.removeItem(getDiffDraftKey(taskId))
}

export function applyDiffSelections(
  segments: Segment[],
  drafts: Record<number, DiffDraftEntry>
): Segment[] {
  return segments.map((seg) => {
    if (seg.type !== 'diff' || drafts[seg.id] === undefined) {
      return seg
    }

    const { selected, customDraft } = drafts[seg.id]
    if (selected?.kind === 'preset' && selected.index >= seg.options.length) {
      return { ...seg, selected: null, customDraft }
    }

    return { ...seg, selected, customDraft }
  })
}
