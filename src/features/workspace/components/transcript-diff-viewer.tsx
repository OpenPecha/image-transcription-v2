import { useMemo, Fragment } from 'react'
import { diff_match_patch, DIFF_DELETE, DIFF_INSERT, DIFF_EQUAL } from 'diff-match-patch'
import { cn } from '@/lib/utils'
import { FONT_FAMILY_MAP } from './constant'
import type { EditorFontFamily } from '@/store/use-ui-store'

interface TranscriptDiffViewerProps {
  initialTranscript: string
  annotatorTranscript: string
  reviewerTranscript: string
  fontFamily: EditorFontFamily
  fontSize: number
}

function buildDiffedSegments(original: string, annotated: string) {
  const dmp = new diff_match_patch()
  const diffs = dmp.diff_main(original, annotated)
  dmp.diff_cleanupSemantic(diffs)
  return diffs
}

function renderTextWithNewlines(text: string) {
  const parts = text.split('\n')
  return (
    <Fragment>
      {parts.map((part, index) => (
        <Fragment key={index}>
          {part}
          {index < parts.length - 1 && (
            <Fragment>
              <span className="inline-block mx-1 select-none font-sans text-[0.85em] opacity-80" aria-hidden="true">
                ↵
              </span>
              {'\n'}
            </Fragment>
          )}
        </Fragment>
      ))}
    </Fragment>
  )
}

interface CharInfo {
  char: string
  isAnnotatorAdded: boolean
}

type RenderSegment =
  | { text: string; type: 'default' }
  | { text: string; type: 'annotator_added' }
  | { text: string; type: 'reviewer_added' }
  | { text: string; type: 'reviewer_deleted' }

export function TranscriptDiffViewer({
  initialTranscript,
  annotatorTranscript,
  reviewerTranscript,
  fontFamily,
  fontSize,
}: TranscriptDiffViewerProps) {
  
  // 1. Diffs between Original OCR and Annotator's Version
  const diffsAB = useMemo(
    () => buildDiffedSegments(initialTranscript, annotatorTranscript),
    [initialTranscript, annotatorTranscript]
  )

  // 2. Diffs between Annotator's Version and Reviewer's Version
  const diffsBC = useMemo(
    () => buildDiffedSegments(annotatorTranscript, reviewerTranscript),
    [annotatorTranscript, reviewerTranscript]
  )

  // Top Pane segments (Original OCR)
  const topSegments = diffsAB
    .filter((d) => d[0] === DIFF_EQUAL || d[0] === DIFF_DELETE)
    .map((d) => ({ text: d[1], type: d[0] }))

  // Build character map for Annotator's Version (B)
  const bChars = useMemo(() => {
    const chars: CharInfo[] = []
    for (const [type, text] of diffsAB) {
      if (type === DIFF_EQUAL) {
        for (const char of text) {
          chars.push({ char, isAnnotatorAdded: false })
        }
      } else if (type === DIFF_INSERT) {
        for (const char of text) {
          chars.push({ char, isAnnotatorAdded: true })
        }
      }
    }
    return chars
  }, [diffsAB])

  // Bottom Pane segments (Reviewer's current text + deleted text)
  const bottomSegments = useMemo(() => {
    const segments: RenderSegment[] = []
    let bIndex = 0

    for (const [type, text] of diffsBC) {
      if (type === DIFF_INSERT) {
        segments.push({ text, type: 'reviewer_added' })
      } else if (type === DIFF_DELETE) {
        segments.push({ text, type: 'reviewer_deleted' })
        bIndex += text.length
      } else if (type === DIFF_EQUAL) {
        if (text.length === 0) continue

        let currentFlag = bChars[bIndex]?.isAnnotatorAdded ?? false
        let currentText = ''

        for (let i = 0; i < text.length; i++) {
          const charInfo = bChars[bIndex + i]
          // Fail-safe if charInfo is somehow undefined
          if (!charInfo) {
            currentText += text[i]
            continue
          }

          if (charInfo.isAnnotatorAdded === currentFlag) {
            currentText += charInfo.char
          } else {
            segments.push({
              text: currentText,
              type: currentFlag ? 'annotator_added' : 'default',
            })
            currentFlag = charInfo.isAnnotatorAdded
            currentText = charInfo.char
          }
        }
        if (currentText.length > 0) {
          segments.push({
            text: currentText,
            type: currentFlag ? 'annotator_added' : 'default',
          })
        }
        bIndex += text.length
      }
    }
    return segments
  }, [diffsBC, bChars])

  const sharedStyle: React.CSSProperties = {
    fontFamily: FONT_FAMILY_MAP[fontFamily],
    fontSize: `${fontSize}px`,
    lineHeight: 1.8,
  }

  // Check if there are changes to display the "Changes detected" badge
  const hasAnnotatorChanges = diffsAB.some((d) => d[0] !== DIFF_EQUAL)
  const hasReviewerChanges = diffsBC.some((d) => d[0] !== DIFF_EQUAL)
  const hasChanges = hasAnnotatorChanges || hasReviewerChanges

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Top: Original OCR */}
      <div className="flex flex-col flex-1 min-h-0 border-b border-border">
        {/* Header */}
        <div className="flex items-center gap-2 px-4 py-2 bg-card/60 shrink-0 border-b border-border">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-rose-500/80" />
            Original OCR
          </span>
        </div>
        {/* Content */}
        <div className="overflow-auto p-5 bg-rose-50/30 dark:bg-rose-950/10 flex-1">
          <p
            className="whitespace-pre-wrap break-words leading-relaxed text-foreground"
            style={sharedStyle}
          >
            {topSegments.map((seg, i) =>
              seg.type === DIFF_DELETE ? (
                <mark
                  key={i}
                  className={cn(
                    'bg-rose-200/70 dark:bg-rose-800/50 text-rose-900 dark:text-rose-200',
                    'rounded px-0.5 ring-1 ring-rose-300 dark:ring-rose-700'
                  )}
                >
                  {renderTextWithNewlines(seg.text)}
                </mark>
              ) : (
                <span key={i}>{renderTextWithNewlines(seg.text)}</span>
              )
            )}
          </p>
        </div>
      </div>

      {/* Bottom: Current Version */}
      <div className="flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 px-4 py-2 bg-card/60 shrink-0 border-b border-border">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span className="inline-block w-2 h-2 rounded-full bg-blue-500/80" />
            Current Version
          </span>
          {!hasChanges && (
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
              ✓ No changes
            </span>
          )}
          {hasChanges && (
            <span className="text-xs text-amber-600 dark:text-amber-400 font-medium bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full">
              Changes detected
            </span>
          )}
        </div>
        {/* Content */}
        <div className="overflow-auto p-5 bg-blue-50/10 dark:bg-blue-950/10 flex-1">
          <p
            className="whitespace-pre-wrap break-words leading-relaxed text-foreground"
            style={sharedStyle}
          >
            {bottomSegments.map((seg, i) => {
              if (seg.type === 'annotator_added') {
                return (
                  <mark
                    key={i}
                    className={cn(
                      'bg-emerald-200/70 dark:bg-emerald-800/50 text-emerald-900 dark:text-emerald-200',
                      'rounded px-0.5 ring-1 ring-emerald-300 dark:ring-emerald-700'
                    )}
                  >
                    {renderTextWithNewlines(seg.text)}
                  </mark>
                )
              }
              if (seg.type === 'reviewer_added') {
                return (
                  <mark
                    key={i}
                    className={cn(
                      'bg-blue-200/70 dark:bg-blue-800/50 text-blue-900 dark:text-blue-200',
                      'rounded px-0.5 ring-1 ring-blue-300 dark:ring-blue-700'
                    )}
                  >
                    {renderTextWithNewlines(seg.text)}
                  </mark>
                )
              }
              if (seg.type === 'reviewer_deleted') {
                return (
                  <mark
                    key={i}
                    className={cn(
                      'bg-orange-200/50 dark:bg-orange-800/30 text-orange-800 dark:text-orange-300',
                      'rounded px-0.5 line-through opacity-70'
                    )}
                  >
                    {renderTextWithNewlines(seg.text)}
                  </mark>
                )
              }
              return <span key={i}>{renderTextWithNewlines(seg.text)}</span>
            })}
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 px-4 py-2 border-t border-border bg-card/60 shrink-0 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-rose-200/70 dark:bg-rose-800/50 ring-1 ring-rose-300 dark:ring-rose-700" />
          Deleted from OCR
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-emerald-200/70 dark:bg-emerald-800/50 ring-1 ring-emerald-300 dark:ring-emerald-700" />
          Added by Annotator
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-blue-200/70 dark:bg-blue-800/50 ring-1 ring-blue-300 dark:ring-blue-700" />
          Added by You
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-3 h-3 rounded bg-orange-200/50 dark:bg-orange-800/30 line-through opacity-70" style={{ textDecorationColor: 'currentColor' }}>
            <span className="opacity-0">x</span>
          </span>
          Deleted by You
        </span>
        <span className="flex items-center gap-1.5 ml-auto">
          <span className="inline-block opacity-80 text-[1.2em]">↵</span>
          Line break
        </span>
      </div>
    </div>
  )
}
