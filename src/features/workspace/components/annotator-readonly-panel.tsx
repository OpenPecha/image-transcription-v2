import { useMemo } from 'react'
import { diff_match_patch, DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL } from 'diff-match-patch'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import { renderVisibleWhitespace } from '../utils/render-visible-whitespace'

type ReferenceSegment =
  | { type: 'default'; text: string }
  | { type: 'highlight'; text: string }

interface AnnotatorReadonlyPanelProps {
  value: string
  /** Other slot transcript used to highlight differing regions. */
  otherValue?: string
  /** True for slot 1 (A); false for slot 2 (B). */
  isPrimarySlot?: boolean
  placeholder: string
  fontFamily: string
  fontSize: number
}

function buildReferenceSegments(
  value: string,
  otherValue: string,
  isPrimarySlot: boolean
): ReferenceSegment[] {
  const dmp = new diff_match_patch()
  const [left, right] = isPrimarySlot ? [value, otherValue] : [otherValue, value]
  const diffs = dmp.diff_main(left, right)
  dmp.diff_cleanupSemantic(diffs)

  const segments: ReferenceSegment[] = []

  for (const [op, text] of diffs) {
    if (!text) continue

    if (op === DIFF_EQUAL) {
      segments.push({ type: 'default', text })
      continue
    }

    if (isPrimarySlot && op === DIFF_DELETE) {
      segments.push({ type: 'highlight', text })
      continue
    }

    if (!isPrimarySlot && op === DIFF_INSERT) {
      segments.push({ type: 'highlight', text })
    }
  }

  return segments
}

export function AnnotatorReadonlyPanel({
  value,
  otherValue = '',
  isPrimarySlot = true,
  placeholder,
  fontFamily,
  fontSize,
}: AnnotatorReadonlyPanelProps) {
  const { t } = useTranslation('workspace')

  const segments = useMemo(() => {
    if (!value.trim()) return []
    if (!otherValue.trim()) return [{ type: 'default' as const, text: value }]
    return buildReferenceSegments(value, otherValue, isPrimarySlot)
  }, [value, otherValue, isPrimarySlot])

  const hasHighlights = segments.some((seg) => seg.type === 'highlight')
  const sharedStyle = { fontFamily, fontSize: `${fontSize}px`, lineHeight: 1.8 }

  if (!value.trim()) {
    return (
      <div className="flex flex-1 flex-col min-h-0">
        <div
          className="flex flex-1 items-center justify-center p-5 text-sm text-muted-foreground"
          style={sharedStyle}
        >
          {placeholder}
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex-1 overflow-auto bg-card p-5">
        <p
          className="whitespace-pre-wrap break-words text-foreground select-text"
          style={sharedStyle}
        >
          {segments.map((seg, index) =>
            seg.type === 'highlight' ? (
              <mark
                key={index}
                className={cn(
                  'rounded px-0.5',
                  'bg-amber-200/80 text-amber-950 ring-1 ring-amber-300/80',
                  'dark:bg-amber-900/50 dark:text-amber-100 dark:ring-amber-700/80'
                )}
              >
                {renderVisibleWhitespace(seg.text, { revealWhitespace: true })}
              </mark>
            ) : (
              <span key={index}>
                {renderVisibleWhitespace(seg.text)}
              </span>
            )
          )}
        </p>
      </div>
      {otherValue.trim() && (
        <div className="shrink-0 border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground">
          <p>
            {hasHighlights
              ? t('diffResolver.referenceDiffHint')
              : t('diffResolver.referenceNoDiffHint')}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="inline-flex items-center gap-1">
              <span className="font-sans opacity-80">␣</span>
              {t('diffResolver.whitespaceSpace')}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="font-sans opacity-80">⇥</span>
              {t('diffResolver.whitespaceTab')}
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="font-sans opacity-80">↵</span>
              {t('diffResolver.whitespaceNewline')}
            </span>
          </p>
        </div>
      )}
    </div>
  )
}
