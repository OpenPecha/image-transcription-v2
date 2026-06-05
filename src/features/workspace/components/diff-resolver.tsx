import { useRef, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { Segment, DiffSegment } from '../utils/parse-tdiff'
import { FONT_FAMILY_MAP } from './constant'
import type { EditorFontFamily } from '@/store/use-ui-store'

interface DiffResolverProps {
  segments: Segment[]
  onSelectDiff: (diffId: number, choice: 's1' | 's2') => void
  resolvedText: string
  fontFamily: EditorFontFamily
  fontSize: number
}

export function DiffResolver({
  segments,
  onSelectDiff,
  resolvedText,
  fontFamily,
  fontSize,
}: DiffResolverProps) {
  const { t } = useTranslation('workspace')
  const pillRefs = useRef<Map<number, HTMLButtonElement>>(new Map())

  // Get all diff segments in order to support navigation
  const diffSegments = segments.filter((seg): seg is DiffSegment => seg.type === 'diff')
  const unresolvedCount = diffSegments.filter((seg) => seg.selected === null).length

  const handlePillKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, diffId: number) => {
      const diffIds = diffSegments.map((seg) => seg.id)
      const currentIndex = diffIds.indexOf(diffId)
      if (currentIndex === -1) return

      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        const nextId = diffIds[(currentIndex + 1) % diffIds.length]
        if (nextId !== undefined) {
          pillRefs.current.get(nextId)?.focus()
        }
      } else if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault()
        const prevId = diffIds[(currentIndex - 1 + diffIds.length) % diffIds.length]
        if (prevId !== undefined) {
          pillRefs.current.get(prevId)?.focus()
        }
      } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault()
        const nextId = diffIds[(currentIndex + 1) % diffIds.length]
        if (nextId !== undefined) {
          pillRefs.current.get(nextId)?.focus()
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault()
        const prevId = diffIds[(currentIndex - 1 + diffIds.length) % diffIds.length]
        if (prevId !== undefined) {
          pillRefs.current.get(prevId)?.focus()
        }
      } else if (e.key === '1') {
        e.preventDefault()
        onSelectDiff(diffId, 's1')
        const nextId = diffIds[(currentIndex + 1) % diffIds.length]
        if (nextId !== undefined) {
          setTimeout(() => {
            pillRefs.current.get(nextId)?.focus()
          }, 50)
        }
      } else if (e.key === '2') {
        e.preventDefault()
        onSelectDiff(diffId, 's2')
        const nextId = diffIds[(currentIndex + 1) % diffIds.length]
        if (nextId !== undefined) {
          setTimeout(() => {
            pillRefs.current.get(nextId)?.focus()
          }, 50)
        }
      }
    },
    [diffSegments, onSelectDiff]
  )

  const resolvedFontFamily = FONT_FAMILY_MAP[fontFamily]

  return (
    <Tabs defaultValue="working" className="flex-1 flex flex-col h-full overflow-hidden bg-card">
      {/* Tabs Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/60 shrink-0">
        <TabsList className="bg-muted/80">
          <TabsTrigger value="working" className="text-xs">
            {t('diffResolver.workingArea')}
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">
            {t('diffResolver.preview')}
          </TabsTrigger>
        </TabsList>

        {/* Unresolved Count / All Resolved Indicator */}
        <div className="text-xs font-semibold select-none">
          {unresolvedCount > 0 ? (
            <span className="text-amber-700 dark:text-amber-400 bg-amber-100/60 dark:bg-amber-950/40 px-2.5 py-1 rounded-full border border-amber-200/50 dark:border-amber-900/50">
              {t('diffResolver.unresolvedCount', { count: unresolvedCount })}
            </span>
          ) : (
            <span className="text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200/50 dark:border-emerald-900/50 flex items-center gap-1">
              <Check className="h-3.5 w-3.5" />
              {t('diffResolver.allResolved')}
            </span>
          )}
        </div>
      </div>

      {/* Working Area Tab */}
      <TabsContent
        value="working"
        className="flex-1 flex flex-col min-h-0 m-0 border-none outline-none overflow-hidden"
      >
        <div
          className="flex-1 overflow-auto p-5 select-text leading-relaxed text-foreground"
          style={{
            fontFamily: resolvedFontFamily,
            fontSize: `${fontSize}px`,
            lineHeight: 1.8,
          }}
        >
          {segments.map((seg, idx) => {
            if (seg.type === 'text') {
              return (
                <span key={`text-${idx}`} className="whitespace-pre-wrap">
                  {seg.content}
                </span>
              )
            }

            const isUnresolved = seg.selected === null
            const displayText = seg.selected ? seg[seg.selected] : '?'

            return (
              <DropdownMenu key={`diff-${seg.id}`}>
                <DropdownMenuTrigger asChild>
                  <button
                    ref={(el) => {
                      if (el) {
                        pillRefs.current.set(seg.id, el)
                      } else {
                        pillRefs.current.delete(seg.id)
                      }
                    }}
                    onKeyDown={(e) => handlePillKeyDown(e, seg.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-medium text-[0.85em] border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 select-none mx-1.5 align-middle cursor-pointer',
                      isUnresolved
                        ? 'bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800 dark:hover:bg-amber-950/90 dark:text-amber-200'
                        : 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:hover:bg-emerald-950/90 dark:text-emerald-200'
                    )}
                    title={
                      isUnresolved
                        ? `Difference unresolved. Option A: ${seg.s1} | Option B: ${seg.s2}`
                        : `Resolved: ${seg[seg.selected!]}`
                    }
                  >
                    <span className="truncate max-w-[320px]" style={{ fontFamily: resolvedFontFamily }}>
                      {displayText}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-[220px] shadow-lg">
                  <DropdownMenuItem
                    onSelect={() => onSelectDiff(seg.id, 's1')}
                    className="flex items-center justify-between gap-4 cursor-pointer py-2 px-3"
                  >
                    <span className="flex-1 text-left truncate" style={{ fontFamily: resolvedFontFamily }}>
                      {t('diffResolver.optionA')}: {seg.s1}
                    </span>
                    {seg.selected === 's1' && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => onSelectDiff(seg.id, 's2')}
                    className="flex items-center justify-between gap-4 cursor-pointer py-2 px-3"
                  >
                    <span className="flex-1 text-left truncate" style={{ fontFamily: resolvedFontFamily }}>
                      {t('diffResolver.optionB')}: {seg.s2}
                    </span>
                    {seg.selected === 's2' && <Check className="h-4 w-4 shrink-0 text-emerald-600" />}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}
        </div>
      </TabsContent>

      {/* Preview Tab */}
      <TabsContent
        value="preview"
        className="flex-1 flex flex-col min-h-0 m-0 border-none outline-none overflow-hidden"
      >
        <textarea
          readOnly
          value={resolvedText}
          className="flex-1 w-full resize-none bg-card p-5 text-foreground focus:outline-none focus:ring-0 border-none select-text"
          style={{
            fontFamily: resolvedFontFamily,
            fontSize: `${fontSize}px`,
            lineHeight: 1.8,
          }}
          placeholder={t('diffResolver.previewPlaceholder')}
        />
      </TabsContent>
    </Tabs>
  )
}
