import { useCallback, useEffect, useRef, useState, type MouseEvent as ReactMouseEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { GripVertical, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  getRejectionHistoryTargetLabelKey,
  getVisibleRejectionHistory,
  hasVisibleRejectionHistory,
  shouldShowRejectionTargetLabel,
} from '@/lib/rejection-history'
import { formatDateTimeLocal } from '@/lib/date-utils'
import type { AssignedTask } from '@/types'
import { cn } from '@/lib/utils'

const REJECTION_HISTORY_PANEL_MIN_WIDTH = 320
const REJECTION_HISTORY_PANEL_MAX_WIDTH = 960
const REJECTION_HISTORY_PANEL_DEFAULT_WIDTH = 448

interface RejectionHistoryProps {
  task: AssignedTask
  role: string | undefined
}

export function RejectionHistory({ task, role }: RejectionHistoryProps) {
  const { t, i18n } = useTranslation('workspace')
  const [open, setOpen] = useState(false)
  const [panelWidth, setPanelWidth] = useState(REJECTION_HISTORY_PANEL_DEFAULT_WIDTH)
  const [isResizing, setIsResizing] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  const handleResizeStart = useCallback((event: ReactMouseEvent) => {
    event.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const handleMouseMove = (event: MouseEvent) => {
      if (!panelRef.current) return
      const panelRect = panelRef.current.getBoundingClientRect()
      const nextWidth = panelRect.right - event.clientX
      setPanelWidth(
        Math.max(
          REJECTION_HISTORY_PANEL_MIN_WIDTH,
          Math.min(REJECTION_HISTORY_PANEL_MAX_WIDTH, nextWidth)
        )
      )
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  if (!hasVisibleRejectionHistory(task, role)) return null

  const entries = getVisibleRejectionHistory(task, role)

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="mt-2 h-auto w-full justify-start gap-1.5 px-0 py-1 text-xs font-normal text-amber-700 hover:bg-amber-500/10 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300"
        onClick={() => setOpen(true)}
      >
        <MessageSquare className="h-3 w-3 shrink-0" />
        <span>{t('rejectionHistory.trigger')}</span>
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          ref={panelRef}
          side="right"
          className="w-full max-w-none sm:max-w-none"
          style={{ width: panelWidth }}
        >
          <div
            className={cn(
              'absolute left-0 top-0 z-10 flex h-full w-3 -translate-x-1/2 cursor-col-resize items-center justify-center',
              'bg-transparent hover:bg-primary/20',
              isResizing && 'bg-primary/40'
            )}
            onMouseDown={handleResizeStart}
            role="separator"
            aria-orientation="vertical"
            aria-label={t('rejectionHistory.resize')}
          >
            <GripVertical className="h-5 w-3 text-muted-foreground/70" aria-hidden="true" />
          </div>

          <SheetHeader>
            <SheetTitle>{t('rejectionHistory.title')}</SheetTitle>
            <SheetDescription>{t('rejectionHistory.description')}</SheetDescription>
          </SheetHeader>

          <SheetBody>
            <ol className="space-y-0">
              {entries.map((entry, index) => {
                const visibleTargets = entry.targets.filter((target) =>
                  shouldShowRejectionTargetLabel(task, role, target)
                )

                return (
                <li key={`${entry.created}-${entry.targets.join('-')}-${index}`}>
                  {index > 0 && <Separator className="my-4" />}
                  <div className="space-y-2">
                    <time
                      dateTime={entry.created}
                      className="block text-xs font-medium text-foreground"
                    >
                      {formatDateTimeLocal(entry.created, i18n.language)}
                    </time>
                    {visibleTargets.length > 0 && (
                      <p className="text-xs font-semibold text-muted-foreground">
                        {visibleTargets
                          .map((target) => `[${t(getRejectionHistoryTargetLabelKey(target))}]`)
                          .join(' ')}
                      </p>
                    )}
                    <ul className="space-y-1 text-sm text-foreground">
                      {entry.comments.map((comment, commentIndex) => (
                        <li key={commentIndex} className="flex gap-2">
                          <span className="shrink-0 text-muted-foreground">•</span>
                          <span className="whitespace-pre-wrap break-words">{comment}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
                )
              })}
            </ol>
          </SheetBody>
        </SheetContent>
      </Sheet>
    </>
  )
}
