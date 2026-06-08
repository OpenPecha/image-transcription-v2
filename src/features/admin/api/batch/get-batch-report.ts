import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/axios'
import { normalizeBatchReport, type BatchReport } from '@/types'
import { batchKeys } from './batch-keys'

const getBatchReport = async (batchId: string): Promise<BatchReport> => {
  const report = (await apiClient.get(`/batch/${batchId}/report`)) as BatchReport
  return normalizeBatchReport(report)
}

export const useGetBatchReport = (batchId: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: batchKeys.report(batchId),
    queryFn: () => getBatchReport(batchId),
    staleTime: 1000 * 60 * 2,
    retry: 1,
    enabled: enabled && !!batchId,
  })
}

