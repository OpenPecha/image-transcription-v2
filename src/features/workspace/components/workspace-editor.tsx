import { useState, useCallback, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { GripHorizontal, GripVertical, Send, Trash2, XCircle } from 'lucide-react'
import { ImageCanvas } from './image-canvas'
import { WorkspaceSidebar } from './workspace-sidebar'
import { TrashConfirmationDialog } from './trash-confirmation-dialog'
import { EditorOverlay } from './editor-overlay'
import { EditorToolbar } from './editor-toolbar'
import { EmptyTasksState } from './empty-tasks-state'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/features/auth'
import { useUIStore } from '@/store/use-ui-store'
import { FONT_FAMILY_MAP } from './constant'
import {
  useGetAssignedTask,
  useSubmitTask,
  useTrashTask,
  useApproveTask,
  useRejectTask,
} from '../api'
import { useLocalDraft } from '../hooks'
import { cn } from '@/lib/utils'
import { UserRole } from '@/types'

export function WorkspaceEditor() {
  const { t } = useTranslation('workspace')
  const { currentUser } = useAuth()
  const { addToast, editorFontFamily, editorFontSize } = useUIStore()

  // State
  const [text, setText] = useState('')
  const [originalOcrText, setOriginalOcrText] = useState('')
  const [splitPosition, setSplitPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [trashDialogOpen, setTrashDialogOpen] = useState(false)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // API hooks
  const {
    data: task,
    isLoading,
    isFetching,
    refetch,
  } = useGetAssignedTask(currentUser?.id)

  const submitTask = useSubmitTask(currentUser?.id)
  const trashTask = useTrashTask(currentUser?.id)
  const approveTask = useApproveTask(currentUser?.id)
  const rejectTask = useRejectTask(currentUser?.id)

  // Local draft auto-save (500ms debounce)
  const { savedDraft, clearDraft } = useLocalDraft({
    taskId: task?.task_id ?? null,
    text,
    delay: 500,
  })

  // Derived states
  const canEdit = task?.state === 'annotating' || task?.state === 'reviewing' || task?.state === 'finalising'
  const isMutating = submitTask.isPending || trashTask.isPending || approveTask.isPending || rejectTask.isPending
  const isLoadingNextTask = isFetching && !isLoading
  const showOverlay = isLoadingNextTask || isMutating

  // Track task ID to detect task changes
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)

  // Load task text when task changes (restore from local draft if available)
  if (task && task.task_id !== currentTaskId) {
    setCurrentTaskId(task.task_id)
    // Restore from local draft if available, otherwise use server transcript
    const restoredText = savedDraft ?? task.task_transcript ?? ''
    setText(restoredText)
    setOriginalOcrText(task.task_transcript ?? '')
  } else if (!task && currentTaskId !== null) {
    setCurrentTaskId(null)
    setText('')
    setOriginalOcrText('')
  }

  // Clear handler for toolbar
  const handleClear = useCallback(() => {
    setText('')
  }, [])

  // Restore original OCR text handler
  const handleRestoreOriginal = useCallback(() => {
    setText(originalOcrText)
  }, [originalOcrText])

  // Submit handler
  const handleSubmit = useCallback(() => {
    if (!task || !currentUser) return

    submitTask.mutate(
      { task_id: task.task_id, user_id: currentUser.id!, transcript: text, submit: true },
      {
        onSuccess: () => {
          clearDraft()
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
  }, [task, currentUser, text, submitTask, clearDraft, addToast, t])

  // Trash handler
  const handleTrash = useCallback(() => {
    if (!task || !currentUser) return

    trashTask.mutate(
      { task_id: task.task_id, user_id: currentUser.id!, submit: false },
      {
        onSuccess: () => {
          clearDraft()
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
  }, [task, currentUser, trashTask, clearDraft, addToast, t])

  // Approve handler
  const handleApprove = useCallback(() => {
    if (!task || !currentUser) return

    approveTask.mutate(
      { task_id: task.task_id, user_id: currentUser.id!, transcript: text, approve: true },
      {
        onSuccess: () => {
          clearDraft()
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
  }, [task, currentUser, text, approveTask, clearDraft, addToast, t])

  // Reject handler
  const handleReject = useCallback(() => {
    if (!task || !currentUser) return

    rejectTask.mutate(
      { task_id: task.task_id, user_id: currentUser.id!, transcript: text, reject: true },
      {
        onSuccess: () => {
          clearDraft()
          addToast({ title: t('toast.rejected'), variant: 'default' })
        },
        onError: (error: Error) => {
          addToast({
            title: t('toast.rejectFailed'),
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }, [task, currentUser, text, rejectTask, clearDraft, addToast, t])

  // Derive layout direction from orientation
  // Portrait images → horizontal split (side-by-side)
  // Landscape images → vertical split (stacked)
  const isHorizontalLayout = task?.orientation === 'portrait'

  // Track orientation changes to reset split position
  const [lastOrientation, setLastOrientation] = useState<string | undefined>(undefined)
  
  // Reset split position to 50% when orientation changes
  if (task?.orientation !== lastOrientation) {
    setLastOrientation(task?.orientation)
    setSplitPosition(50)
  }

  // Split pane handlers
  const handleMouseDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!isDragging) return
      const container = e.currentTarget as HTMLElement
      const rect = container.getBoundingClientRect()

      // Calculate position based on layout direction
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

  // Loading state - keep sidebar visible, only skeleton main area
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

  // Empty state - no task available
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
      {/* Sidebar */}
      <WorkspaceSidebar
        task={task}
        onRefresh={() => refetch()}
        isLoading={isFetching}
      />

      {/* Main Content */}
      <main className="flex-1 ml-60 flex flex-col">
        {/* Split Pane Container */}
        <div
          className={cn(
            'relative flex-1 flex overflow-hidden',
            isHorizontalLayout ? 'flex-row' : 'flex-col'
          )}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Loading/Mutation Overlay */}
          <EditorOverlay
            show={showOverlay}
            message={isMutating ? t('loading.processing') : t('loading.loadingNext')}
          />

          {/* Image Panel */}
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

          {/* Text Editor Panel */}
          <div
            className={cn(
              'overflow-hidden bg-muted/30 flex-1 flex flex-col',
              isHorizontalLayout ? 'h-full' : 'w-full'
            )}
          >
            {/* Editor Toolbar */}
            <EditorToolbar
              onClear={handleClear}
              onRestoreOriginal={handleRestoreOriginal}
              hasContent={text.length > 0}
              hasOriginalContent={originalOcrText.length > 0 && text !== originalOcrText}
              isDisabled={!canEdit || showOverlay}
            />

            {/* Textarea */}
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
          </div>
        </div>

        {/* Footer */}
        <footer className="grid grid-cols-3 items-center border-t border-border bg-card px-6 py-3">
          {/* Left Section: Empty Spacer */}
          <div className="flex items-center" />

          {/* Center Section: Actions (Perfectly centered) */}
          <div className="flex items-center justify-center gap-3">
            {currentUser?.role === UserRole.Annotator && (
              <>
                <Button
                  variant="success"
                  onClick={handleSubmit}
                  disabled={showOverlay || !canEdit}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {submitTask.isPending ? t('actions.submitting') : t('actions.submit')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setTrashDialogOpen(true)}
                  disabled={showOverlay || !canEdit}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('actions.trash')}
                </Button>
              </>
            )}

            {(currentUser?.role === UserRole.Reviewer || currentUser?.role === UserRole.FinalReviewer) && (
              <>
                <Button
                  variant="success"
                  onClick={handleApprove}
                  disabled={showOverlay || !canEdit}
                >
                  <Send className="h-4 w-4 mr-2" />
                  {approveTask.isPending ? t('actions.approving') : t('actions.approve')}
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={showOverlay || !canEdit}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  {t('actions.reject')}
                </Button>
              </>
            )}
          </div>

          {/* Right Section: Empty Spacer (Ensures center stays center) */}
          <div className="flex justify-end">
            {/* You can put word counts or page numbers here later */}
          </div>
        </footer>
      </main>

      {/* Trash Dialog */}
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
