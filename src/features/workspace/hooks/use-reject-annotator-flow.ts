import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useRejectAnnotatorTask } from '../api/task/reject-annotator-task'
import type { RejectTarget } from '../types/reject-target'
import type { AssignedTask } from '@/types'

interface UseRejectAnnotatorFlowOptions {
  task: AssignedTask | null | undefined
  userId: string | undefined
  enabled: boolean
  clearDrafts: () => void
  addToast: (toast: {
    title: string
    description?: string
    variant?: 'default' | 'success' | 'destructive'
  }) => void
}

export function useRejectAnnotatorFlow({
  task,
  userId,
  enabled,
  clearDrafts,
  addToast,
}: UseRejectAnnotatorFlowOptions) {
  const { t } = useTranslation('workspace')
  const rejectTask = useRejectAnnotatorTask(userId)
  const [open, setOpen] = useState(false)

  const openRejectDialog = useCallback(() => {
    if (!enabled || !task) return
    setOpen(true)
  }, [enabled, task])

  const closeDialog = useCallback(() => {
    setOpen(false)
  }, [])

  const handleOpenChange = useCallback((nextOpen: boolean) => {
    if (!rejectTask.isPending) setOpen(nextOpen)
  }, [rejectTask.isPending])

  const selectRejectTarget = useCallback(
    (target: RejectTarget) => {
      if (!task || !userId || rejectTask.isPending) return

      rejectTask.mutate(
        { task_id: task.task_id, user_id: userId, reject_target: target },
        {
          onSuccess: () => {
            clearDrafts()
            setOpen(false)
            addToast({
              title: t('toast.rejected'),
              description: t('toast.rejectedDescription', { taskName: task.task_name }),
              variant: 'default',
            })
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
    },
    [task, userId, rejectTask, clearDrafts, addToast, t]
  )

  return {
    openRejectDialog,
    dialogProps: {
      open,
      onOpenChange: handleOpenChange,
      onCancel: closeDialog,
      onSelectTarget: selectRejectTarget,
      isLoading: rejectTask.isPending,
      taskName: task?.task_name ?? '',
    },
    isRejecting: rejectTask.isPending,
  }
}
