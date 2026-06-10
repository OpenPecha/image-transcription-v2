import { useMutation, useQueryClient } from '@tanstack/react-query'
import { workspaceKeys } from './workspace-keys'
import { apiClient } from '@/lib/axios'
import { APPLICATION_NAME } from '@/lib/constant'
import type { RejectTarget } from '../../types/reject-target'

export interface RejectAnnotatorTaskParams {
  task_id: string
  user_id: string
  reject_target: RejectTarget
}

interface RejectAnnotatorTaskResponse {
  success: boolean
  message?: string
}

const rejectAnnotatorTask = async (
  params: RejectAnnotatorTaskParams
): Promise<RejectAnnotatorTaskResponse> => {
  return apiClient.post(`/tasks/${APPLICATION_NAME}/submit/${params.task_id}`, {
    user_id: params.user_id,
    submit: false,
    reject_target: params.reject_target,
  })
}

export const useRejectAnnotatorTask = (user_id?: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: rejectAnnotatorTask,
    onSuccess: () => {
      if (user_id) {
        queryClient.invalidateQueries({ queryKey: workspaceKeys.assignedTask(user_id) })
      }
    },
  })
}
