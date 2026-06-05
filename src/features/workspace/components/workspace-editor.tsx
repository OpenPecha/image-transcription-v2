import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { GripHorizontal, GripVertical, Send, Trash2 } from 'lucide-react'
import { ImageCanvas } from './image-canvas'
import { WorkspaceSidebar } from './workspace-sidebar'
import { TrashConfirmationDialog } from './trash-confirmation-dialog'
import { EditorOverlay } from './editor-overlay'
import { EditorToolbar } from './editor-toolbar'
import { EmptyTasksState } from './empty-tasks-state'
import { DiffResolver } from './diff-resolver'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth'
import { useUIStore } from '@/store/use-ui-store'
import { FONT_FAMILY_MAP } from './constant'
import {
  parseTDiff,
  resolveSegments,
  allDiffsResolved,
  applyDiffSelections,
  loadDiffDraftSelections,
  saveDiffDraftSelections,
  clearDiffDraft,
  type Segment,
} from '../utils/parse-tdiff'
import {
  useGetAssignedTask,
  useSubmitTask,
  useTrashTask,
  useApproveTask,
} from '../api'
import { loadNonEmptyTextDraft, useLocalDraft } from '../hooks'
import { cn } from '@/lib/utils'
import {
  UserRole,
  isEditableTaskState,
  canAnnotatorTrashTask,
  getAnnotatorBaselineTranscript,
} from '@/types'

function isReviewerRole(role: UserRole | string | undefined): boolean {
  return role === UserRole.Reviewer || role === 'reveiwer'
}

export function WorkspaceEditor() {
  const { t } = useTranslation('workspace')
  const { currentUser } = useAuth()
  const { addToast, editorFontFamily, editorFontSize } = useUIStore()

  const [text, setText] = useState('')
  const [originalOcrText, setOriginalOcrText] = useState('')
  const [splitPosition, setSplitPosition] = useState(55)
  const [isDragging, setIsDragging] = useState(false)
  const [trashDialogOpen, setTrashDialogOpen] = useState(false)
  const [segments, setSegments] = useState<Segment[]>([])

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    data: task,
    isLoading,
    isFetching,
    refetch,
  } = useGetAssignedTask(currentUser?.id)

  const submitTask = useSubmitTask(currentUser?.id)
  const trashTask = useTrashTask(currentUser?.id)
  const approveTask = useApproveTask(currentUser?.id)

  const isReviewer = isReviewerRole(currentUser?.role)
  const isAnnotator = currentUser?.role === UserRole.Annotator
  const canTrash = isAnnotator && task ? canAnnotatorTrashTask(task.state) : false
  const hasDiffs =
    isReviewer && (task?.task_transcript?.includes('<t-diff') ?? false)
  const resolvedText = useMemo(() => resolveSegments(segments), [segments])

  const { clearDraft } = useLocalDraft({
    taskId: task?.task_id ?? null,
    text,
    delay: 500,
    enabled: !hasDiffs,
  })

  const canEdit = task ? isEditableTaskState(task.state) : false
  const isMutating = submitTask.isPending || trashTask.isPending || approveTask.isPending
  const isLoadingNextTask = isFetching && !isLoading
  const showOverlay = isLoadingNextTask || isMutating

  const transcriptForSubmit = hasDiffs ? resolvedText : text

  // Sync editor state when the assigned task changes
  useEffect(() => {
    if (!task) {
      setText('')
      setOriginalOcrText('')
      setSegments([])
      return
    }

    const transcript = isReviewer
      ? (task.task_transcript ?? '')
      : getAnnotatorBaselineTranscript(task)

    const parsed = parseTDiff(transcript)
    const containsDiffs = isReviewer && parsed.some((seg) => seg.type === 'diff')

    let nextSegments = parsed
    if (containsDiffs) {
      const savedSelections = loadDiffDraftSelections(task.task_id)
      if (savedSelections) {
        nextSegments = applyDiffSelections(parsed, savedSelections)
      }
    }

    setSegments(nextSegments)
    setOriginalOcrText(transcript)

    if (containsDiffs) {
      setText(resolveSegments(nextSegments))
    } else if (!isReviewer) {
      const draft = loadNonEmptyTextDraft(task.task_id)
      setText(draft ?? transcript)
    } else {
      setText('')
    }
  }, [task?.task_id, task?.task_transcript, task?.initial_transcript, task?.state, isReviewer])

  // Reset split position when image orientation changes
  useEffect(() => {
    if (task?.orientation) {
      setSplitPosition(50)
    }
  }, [task?.orientation])

  const handleClear = useCallback(() => {
    setText('')
  }, [])

  const handleRestoreOriginal = useCallback(() => {
    setText(originalOcrText)
  }, [originalOcrText])

  const clearAllDrafts = useCallback(() => {
    clearDraft()
    if (task) {
      clearDiffDraft(task.task_id)
    }
  }, [clearDraft, task])

  const handleSelectDiff = useCallback(
    (diffId: number, choice: 's1' | 's2') => {
      setSegments((prev) => {
        const next = prev.map((seg) =>
          seg.type === 'diff' && seg.id === diffId ? { ...seg, selected: choice } : seg
        )
        if (task) {
          saveDiffDraftSelections(task.task_id, next)
        }
        return next
      })
    },
    [task]
  )

  const handleSubmit = useCallback(() => {
    if (!task || !currentUser) return

    submitTask.mutate(
      { task_id: task.task_id, user_id: currentUser.id!, transcript: transcriptForSubmit, submit: true },
      {
        onSuccess: () => {
          clearAllDrafts()
          addToast({
            title: t('toast.submitted'),
            description: t('toast.submittedDescription'),
            variant: 'success',
          })
        },
        onError: (error: Error) => {
          addToast({
            title: t('toast.submitFailed'),
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }, [task, currentUser, transcriptForSubmit, submitTask, clearAllDrafts, addToast, t])

  const handleTrash = useCallback(() => {
    if (!task || !currentUser) return

    trashTask.mutate(
      { task_id: task.task_id, user_id: currentUser.id!, submit: false },
      {
        onSuccess: () => {
          clearAllDrafts()
          setTrashDialogOpen(false)
          addToast({ title: t('toast.trashed'), variant: 'default' })
        },
        onError: (error: Error) => {
          addToast({
            title: t('toast.trashFailed'),
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }, [task, currentUser, trashTask, clearAllDrafts, addToast, t])

  const handleApprove = useCallback(() => {
    if (!task || !currentUser) return

    approveTask.mutate(
      {
        task_id: task.task_id,
        user_id: currentUser.id!,
        transcript: transcriptForSubmit,
        approve: true,
      },
      {
        onSuccess: () => {
          clearAllDrafts()
          addToast({
            title: t('toast.approved'),
            description: t('toast.approvedDescription'),
            variant: 'success',
          })
        },
        onError: (error: Error) => {
          addToast({
            title: t('toast.approveFailed'),
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }, [task, currentUser, transcriptForSubmit, approveTask, clearAllDrafts, addToast, t])

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
    return (
      <div className="flex h-screen">
        <WorkspaceSidebar
          task={null}
          onRefresh={() => refetch()}
          isLoading={true}
        />
        <main className="flex-1 ml-60 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <Skeleton className="h-full w-full m-4 rounded-lg" />
          </div>
        </main>
      </div>
    )
  }

  if (!task) {
    const noApplicationMessage = !currentUser?.application
      ? 'You have no application assigned. Please contact your administrator.'
      : undefined

    return (
      <div className="flex h-screen">
        <WorkspaceSidebar
          task={null}
          onRefresh={() => refetch()}
          isLoading={isLoading || isFetching}
        />
        <main className="flex-1 ml-60">
          <EmptyTasksState
            onRefresh={() => refetch()}
            isLoading={isLoading}
            message={noApplicationMessage}
          />
        </main>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background">
      <WorkspaceSidebar
        task={task}
        onRefresh={() => refetch()}
        isLoading={isFetching}
      />

      <main className="flex-1 ml-60 flex flex-col">
        <div
          className={cn(
            'relative flex-1 flex overflow-hidden',
            isHorizontalLayout ? 'flex-row' : 'flex-col'
          )}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <EditorOverlay
            show={showOverlay}
            message={isMutating ? t('loading.processing') : t('loading.loadingNext')}
          />

          <div
            className={cn(
              'overflow-hidden flex-shrink-0',
              isHorizontalLayout ? 'border-r border-border h-full' : 'border-b border-border w-full'
            )}
            style={
              isHorizontalLayout
                ? { width: `calc(${splitPosition}% - 6px)` }
                : { height: `${splitPosition}%` }
            }
          >
            <ImageCanvas imageUrl={task.task_url} />
          </div>

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

          <div
            className={cn(
              'overflow-hidden bg-muted/30 flex-1 flex flex-col',
              isHorizontalLayout ? 'h-full' : 'w-full'
            )}
          >
            <EditorToolbar
              onClear={handleClear}
              onRestoreOriginal={handleRestoreOriginal}
              hasContent={isAnnotator && !hasDiffs && text.length > 0}
              hasOriginalContent={
                isAnnotator && !hasDiffs && originalOcrText.length > 0 && text !== originalOcrText
              }
              isDisabled={!canEdit || showOverlay}
            />

            {hasDiffs ? (
              <DiffResolver
                segments={segments}
                onSelectDiff={handleSelectDiff}
                resolvedText={resolvedText}
                fontFamily={editorFontFamily}
                fontSize={editorFontSize}
              />
            ) : isReviewer ? (
              <div className="flex flex-1 items-center justify-center p-8 text-center bg-card">
                <p className="max-w-md text-sm text-muted-foreground">
                  {t('reviewer.pendingAlignment')}
                </p>
              </div>
            ) : (
              <textarea
                id="editor-textarea"
                name="editor-textarea"
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                readOnly={!canEdit || showOverlay}
                placeholder={t('editor.placeholder')}
                className={cn(
                  'flex-1 w-full resize-none bg-card p-5',
                  'text-foreground placeholder:text-placeholder',
                  'focus:outline-none focus:ring-0',
                  'transition-all duration-200',
                  (!canEdit || showOverlay) && 'cursor-default opacity-80'
                )}
                style={{
                  fontFamily: FONT_FAMILY_MAP[editorFontFamily],
                  fontSize: `${editorFontSize}px`,
                  lineHeight: 1.6,
                }}
                spellCheck={false}
              />
            )}
          </div>
        </div>

        <footer className="grid grid-cols-3 items-center border-t border-border bg-card px-6 py-3">
          <div className="flex items-center" />

          <div className="flex items-center justify-center gap-3">
            {isAnnotator && (
              <>
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={showOverlay || !canEdit}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitTask.isPending ? t('actions.submitting') : t('actions.submit')}
                </Button>
                {canTrash && (
                  <Button
                    variant="destructive"
                    onClick={() => setTrashDialogOpen(true)}
                    disabled={showOverlay || !canEdit}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {t('actions.trash')}
                  </Button>
                )}
              </>
            )}

            {isReviewer && (
              <Button
                variant="success"
                onClick={handleApprove}
                disabled={
                  showOverlay ||
                  !canEdit ||
                  (hasDiffs && !allDiffsResolved(segments))
                }
              >
                <Send className="h-4 w-4 mr-2" />
                {approveTask.isPending ? t('actions.approving') : t('actions.approve')}
              </Button>
            )}
          </div>

          <div className="flex justify-end" />
        </footer>
      </main>

      <TrashConfirmationDialog
        open={trashDialogOpen}
        onOpenChange={setTrashDialogOpen}
        onConfirm={handleTrash}
        onCancel={() => setTrashDialogOpen(false)}
        isLoading={trashTask.isPending}
        taskName={task.task_name}
      />
    </div>
  )
}
