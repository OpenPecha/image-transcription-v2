import { Skeleton } from '@/components/ui/skeleton'
import type { ApplicationBatchReport } from '@/types'

function percent(part: number, total: number): number {
  if (total <= 0) return 0
  return Math.round((part / total) * 100)
}

interface ApplicationBatchSummaryProps {
  report: ApplicationBatchReport | undefined
  isLoading: boolean
}

export function ApplicationBatchSummary({ report, isLoading }: ApplicationBatchSummaryProps) {
  if (isLoading) {
    return (
      <div className="space-y-3 pb-4">
        <Skeleton className="h-4 w-56" />
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      </div>
    )
  }

  if (!report) return null

  const total = report.total_tasks
  const stats = [
    { label: 'Total', value: report.total_tasks, meta: '100%' },
    { label: 'Pending', value: report.pending, meta: `${percent(report.pending, total)}%` },
    { label: 'Half Annotated', value: report.half_annotated, meta: `${percent(report.half_annotated, total)}%` },
    { label: 'Annotated', value: report.annotated, meta: `${percent(report.annotated, total)}%` },
    { label: 'Half Reviewed', value: report.half_reviewed, meta: `${percent(report.half_reviewed, total)}%` },
    { label: 'Reviewed', value: report.reviewed, meta: `${percent(report.reviewed, total)}%` },
    { label: 'Finalised', value: report.finalised, meta: `${percent(report.finalised, total)}%` },
    { label: 'Trashed', value: report.trashed, meta: `${percent(report.trashed, total)}%` },
  ] as const

  return (
    <div className="space-y-3 pb-4">
      <div className="space-y-0.5">
        <div className="text-sm font-semibold tracking-tight capitalize">
          {report.name}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {stats.map((item) => (
          <div key={item.label} className="rounded-lg border bg-card px-3 py-2">
            <div className="text-[11px] font-medium text-muted-foreground">{item.label}</div>
            <div className="mt-1 flex items-baseline gap-2">
              <div className="text-lg font-semibold tabular-nums leading-none">{item.value}</div>
              <div className="text-xs text-muted-foreground tabular-nums">{item.meta}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

