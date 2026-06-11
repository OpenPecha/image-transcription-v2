import { useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { GripHorizontal, GripVertical, RotateCcw } from 'lucide-react'
import { ImageCanvas } from '@/features/workspace/components/image-canvas'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { BatchTask } from '@/types'
import { TaskParticipantsBar } from './task-participants-bar'

interface TaskPreviewProps {
  task: BatchTask | null
  onRestore: () => void
  isRestoring: boolean
  isLoading: boolean
}

export function TaskPreview({
  task,
  onRestore,
  isRestoring,
  isLoading,
}: TaskPreviewProps) {
  const { t } = useTranslation('admin')
  const [splitPosition, setSplitPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)

  const isHorizontalLayout = task?.orientation === 'portrait'

  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const container = e.currentTarget as HTMLElement
      const rect = container.getBoundingClientRect()

      const position = isHorizontalLayout
        ? ((e.clientX - rect.left) / rect.width) * 100
        : ((e.clientY - rect.top) / rect.height) * 100

      setSplitPosition(Math.max(20, Math.min(80, position)))
    },
    [isDragging, isHorizontalLayout]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  if (isLoading) {
    return <TaskPreviewSkeleton />
  }

  if (!task) {
    return (
      <div className="flex flex-col h-full bg-muted/20">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">{t('batches.noTaskSelected')}</p>
            <p className="text-sm mt-1">{t('batches.selectTaskToPreview')}</p>
          </div>
        </div>
      </div>
    )
  }

  const canRestore = task.state === 'trashed'

  return (
    <div className="flex flex-col h-full">
      {/* Content Area - Dynamic Layout */}
      <div
        className={cn(
          'flex-1 min-h-0 flex overflow-hidden',
          isHorizontalLayout ? 'flex-row' : 'flex-col'
        )}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Image Section */}
        <div
          className={cn(
            'overflow-hidden flex-shrink-0',
            isHorizontalLayout
              ? 'h-full border-r border-border'
              : 'w-full border-b border-border'
          )}
          style={
            isHorizontalLayout
              ? { width: `calc(${splitPosition}% - 6px)` }
              : { height: `${splitPosition}%` }
          }
        >
          <ImageCanvas imageUrl={task.task_url} />
        </div>

        {/* Resize Handle */}
        <div
          className={cn(
            'flex-shrink-0 flex items-center justify-center bg-border/80 transition-colors select-none',
            isHorizontalLayout
              ? 'w-3 cursor-col-resize hover:bg-primary/40'
              : 'h-2 cursor-row-resize hover:bg-primary/50',
            isDragging && 'bg-primary/60'
          )}
          onMouseDown={handleMouseDown}
        >
          {isHorizontalLayout ? (
            <GripVertical className="h-6 w-4 text-muted-foreground/70" />
          ) : (
            <GripHorizontal className="h-3 w-5 text-muted-foreground" />
          )}
        </div>

        {/* Transcript Section */}
        <div
          className={cn(
            'bg-sky-50 dark:bg-sky-900/20 overflow-hidden flex-1 flex flex-col',
            isHorizontalLayout ? 'h-full pt-12' : 'w-full'
          )}
        >
          <div className="flex-1 flex flex-col min-h-0">
            {/* <h4 className="text-sm font-medium text-muted-foreground mb-2 flex-shrink-0">
              {t('batches.transcript')}
            </h4> */}
            <div className="flex-1 min-h-0 p-3 bg-background border border-border overflow-y-auto">
              <p
                className="text-sm leading-relaxed whitespace-pre-wrap"
                style={{
                  fontFamily: 'Monlam',
                  fontSize: '1.1rem',
                  lineHeight: 1.6,
                }}
              >
                {task.task_transcript || (
                  <span className="text-muted-foreground italic">
                    {t('batches.noTranscript')}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer with Restore Button */}
      {canRestore && (
        <div className="flex flex-shrink-0 justify-center border-t border-border bg-card px-4 py-3">
          <Button
            variant="outline"
            onClick={onRestore}
            disabled={!canRestore || isRestoring}
            className={cn(
              'min-w-[140px]',
              canRestore && 'hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300'
            )}
          >
            <RotateCcw className={cn('h-4 w-4 mr-2', isRestoring && 'animate-spin')} />
            {isRestoring ? t('batches.restoring') : t('batches.restore')}
          </Button>
        </div>
      )}

      <TaskParticipantsBar task={task} />
    </div>
  )
}

function TaskPreviewSkeleton() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 min-h-0 p-2">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="flex-1 border-t border-border bg-sky-50 dark:bg-sky-900/20 p-2">
        <Skeleton className="h-full w-full" />
      </div>
      <div className="border-t border-border bg-card px-4 py-3 flex justify-center">
        <Skeleton className="h-10 w-[140px]" />
      </div>
    </div>
  )
}