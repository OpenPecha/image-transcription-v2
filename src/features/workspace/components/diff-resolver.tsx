import { useRef, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
} from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { DiffSelection, Segment, DiffSegment } from '../utils/parse-tdiff'
import { getDiffResolvedValue, isDiffResolved } from '../utils/parse-tdiff'
import { FONT_FAMILY_MAP } from './constant'
import type { EditorFontFamily } from '@/store/use-ui-store'

interface DiffResolverProps {
  segments: Segment[]
  onResolveDiff: (diffId: number, selection: DiffSelection) => void
  onUpdateCustomDraft: (diffId: number, value: string) => void
  resolvedText: string
  fontFamily: EditorFontFamily
  fontSize: number
}

function getPresetLabel(index: number): string {
  if (index === 0) return 'A'
  if (index === 1) return 'B'
  return String(index + 1)
}

export function DiffResolver({
  segments,
  onResolveDiff,
  onUpdateCustomDraft,
  resolvedText,
  fontFamily,
  fontSize,
}: DiffResolverProps) {
  const { t } = useTranslation('workspace')
  const pillRefs = useRef<Map<number, HTMLButtonElement>>(new Map())
  const customInputRefs = useRef<Map<number, HTMLTextAreaElement>>(new Map())
  const [openDiffId, setOpenDiffId] = useState<number | null>(null)

  const diffSegments = segments.filter((seg): seg is DiffSegment => seg.type === 'diff')
  const unresolvedCount = diffSegments.filter((seg) => !isDiffResolved(seg)).length

  const focusDiff = useCallback((diffId: number) => {
    setTimeout(() => {
      pillRefs.current.get(diffId)?.focus()
    }, 50)
  }, [])

  const navigateBetweenDiffs = useCallback(
    (currentDiffId: number, direction: 'prev' | 'next', options?: { keepOpen?: boolean }) => {
      const diffIds = diffSegments.map((seg) => seg.id)
      const currentIndex = diffIds.indexOf(currentDiffId)
      if (currentIndex === -1) return

      const targetId =
        direction === 'next'
          ? diffIds[(currentIndex + 1) % diffIds.length]
          : diffIds[(currentIndex - 1 + diffIds.length) % diffIds.length]

      if (targetId === undefined) return

      setOpenDiffId(options?.keepOpen ? targetId : null)

      setTimeout(() => {
        if (options?.keepOpen) {
          customInputRefs.current.get(targetId)?.focus()
        } else {
          pillRefs.current.get(targetId)?.focus()
        }
      }, 50)
    },
    [diffSegments]
  )

  const selectPreset = useCallback(
    (diffId: number, index: number, options?: { keepOpen?: boolean }) => {
      onResolveDiff(diffId, { kind: 'preset', index })
      if (options?.keepOpen) {
        setOpenDiffId(diffId)
      } else {
        setOpenDiffId(null)
        focusDiff(diffId)
      }
    },
    [onResolveDiff, focusDiff]
  )

  const handlePillKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, seg: DiffSegment) => {
      const diffId = seg.id

      if (e.key === 'Tab' && !e.shiftKey) {
        e.preventDefault()
        navigateBetweenDiffs(diffId, 'next')
        return
      }
      if (e.key === 'Tab' && e.shiftKey) {
        e.preventDefault()
        navigateBetweenDiffs(diffId, 'prev')
        return
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateBetweenDiffs(diffId, 'next')
        return
      }
      if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateBetweenDiffs(diffId, 'prev')
        return
      }

      const presetIndex = Number(e.key) - 1
      if (presetIndex >= 0 && presetIndex < seg.options.length) {
        e.preventDefault()
        selectPreset(diffId, presetIndex, { keepOpen: true })
        return
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        setOpenDiffId(diffId)
        setTimeout(() => customInputRefs.current.get(diffId)?.focus(), 50)
      }
    },
    [selectPreset, navigateBetweenDiffs]
  )

  const handleMenuKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>, seg: DiffSegment) => {
      const diffId = seg.id
      const presetIndex = Number(e.key) - 1

      if (presetIndex >= 0 && presetIndex < seg.options.length) {
        e.preventDefault()
        selectPreset(diffId, presetIndex, { keepOpen: true })
        return
      }

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault()
        customInputRefs.current.get(diffId)?.focus()
        return
      }

      if (e.key === 'ArrowRight') {
        e.preventDefault()
        navigateBetweenDiffs(diffId, 'next', { keepOpen: true })
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        navigateBetweenDiffs(diffId, 'prev', { keepOpen: true })
      }
    },
    [selectPreset, navigateBetweenDiffs]
  )

  const resolvedFontFamily = FONT_FAMILY_MAP[fontFamily]

  return (
    <Tabs defaultValue="working" className="flex-1 flex flex-col h-full overflow-hidden bg-card">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card/60 shrink-0">
        <TabsList className="bg-muted/80">
          <TabsTrigger value="working" className="text-xs">
            {t('diffResolver.workingArea')}
          </TabsTrigger>
          <TabsTrigger value="preview" className="text-xs">
            {t('diffResolver.preview')}
          </TabsTrigger>
        </TabsList>

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

            const isUnresolved = !isDiffResolved(seg)
            const displayText = isUnresolved ? '?' : getDiffResolvedValue(seg)
            const customValue = seg.customDraft
            const optionsSummary = seg.options
              .map((option, index) => `${getPresetLabel(index)}: ${option}`)
              .join(' | ')

            return (
              <DropdownMenu
                key={`diff-${seg.id}`}
                open={openDiffId === seg.id}
                onOpenChange={(open) => setOpenDiffId(open ? seg.id : null)}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    ref={(el) => {
                      if (el) {
                        pillRefs.current.set(seg.id, el)
                      } else {
                        pillRefs.current.delete(seg.id)
                      }
                    }}
                    onKeyDown={(e) => handlePillKeyDown(e, seg)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full font-medium text-[0.85em] border shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 select-none mx-1.5 align-middle cursor-pointer',
                      isUnresolved
                        ? 'bg-amber-100 border-amber-300 hover:bg-amber-200 text-amber-900 dark:bg-amber-950/60 dark:border-amber-800 dark:hover:bg-amber-950/90 dark:text-amber-200'
                        : 'bg-emerald-100 border-emerald-300 hover:bg-emerald-200 text-emerald-900 dark:bg-emerald-950/60 dark:border-emerald-800 dark:hover:bg-emerald-950/90 dark:text-emerald-200'
                    )}
                    title={
                      isUnresolved
                        ? `${optionsSummary} | ${t('diffResolver.optionCustom')}`
                        : `${t('diffResolver.resolved')}: ${displayText}`
                    }
                  >
                    <span className="truncate max-w-[320px]" style={{ fontFamily: resolvedFontFamily }}>
                      {displayText}
                    </span>
                    <ChevronDown className="h-3.5 w-3.5 opacity-60 shrink-0" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="start"
                  className="min-w-[260px] shadow-lg"
                  onKeyDown={(e) => handleMenuKeyDown(e, seg)}
                >
                  {seg.options.map((option, index) => {
                    const isSelected =
                      seg.selected?.kind === 'preset' && seg.selected.index === index
                    const shortcut = index < 9 ? String(index + 1) : undefined

                    return (
                      <DropdownMenuItem
                        key={index}
                        onSelect={(e) => {
                          e.preventDefault()
                          selectPreset(seg.id, index, { keepOpen: true })
                        }}
                        className="flex items-center justify-between gap-4 cursor-pointer py-2 px-3"
                      >
                        <span className="flex-1 text-left truncate" style={{ fontFamily: resolvedFontFamily }}>
                          {t('diffResolver.optionPreset', { label: getPresetLabel(index) })}: {option}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          {isSelected && <Check className="h-4 w-4 text-emerald-600" />}
                          {shortcut && <DropdownMenuShortcut>{shortcut}</DropdownMenuShortcut>}
                        </div>
                      </DropdownMenuItem>
                    )
                  })}
                  <div className="border-t border-border px-3 py-2 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <label
                        htmlFor={`diff-custom-${seg.id}`}
                        className="text-xs font-medium text-muted-foreground"
                      >
                        {t('diffResolver.optionCustom')}
                      </label>
                      {seg.selected?.kind === 'custom' && seg.selected.value.trim().length > 0 && (
                        <Check className="h-4 w-4 text-emerald-600 shrink-0" />
                      )}
                    </div>
                    <Textarea
                      id={`diff-custom-${seg.id}`}
                      ref={(el) => {
                        if (el) {
                          customInputRefs.current.set(seg.id, el)
                        } else {
                          customInputRefs.current.delete(seg.id)
                        }
                      }}
                      value={customValue}
                      onChange={(e) => onUpdateCustomDraft(seg.id, e.target.value)}
                      placeholder={t('diffResolver.customPlaceholder')}
                      rows={2}
                      className="min-h-8 h-auto max-h-24 resize-y text-sm py-1.5"
                      style={{ fontFamily: resolvedFontFamily }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          setOpenDiffId(null)
                          focusDiff(seg.id)
                        }
                      }}
                    />
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            )
          })}
        </div>
      </TabsContent>

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
