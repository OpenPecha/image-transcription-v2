import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { APPLICATION_NAME } from '@/lib/constant'
import type { BatchTaskSearchResult } from '@/types'
import { batchKeys } from './batch-keys'

const MIN_SEARCH_LENGTH = 2

const searchApplicationTasks = async (
  applicationName: string,
  taskName: string
): Promise<BatchTaskSearchResult[]> => {
  const response = await apiClient.get<
    BatchTaskSearchResult | BatchTaskSearchResult[] | null
  >(`/batch/application/${applicationName}/tasks/search`, {
    params: { task_name: taskName },
  })

  if (!response) return []
  return Array.isArray(response) ? response : [response]
}

export const useSearchApplicationTasks = (submittedTaskName: string) => {
  const trimmedTaskName = submittedTaskName.trim()
  const enabled = trimmedTaskName.length >= MIN_SEARCH_LENGTH

  return useQuery({
    queryKey: batchKeys.taskSearch(APPLICATION_NAME, trimmedTaskName),
    queryFn: () => searchApplicationTasks(APPLICATION_NAME, trimmedTaskName),
    enabled,
    staleTime: 1000 * 30,
  })
}

export { MIN_SEARCH_LENGTH }
