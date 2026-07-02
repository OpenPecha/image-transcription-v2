import type { ReactNode } from 'react'
import {
  formatReportNumber,
  formatReportPercent,
  formatReportSignedNumber,
  getSummaryRejectedCount,
  getSummaryRejectedPercent,
  getSummaryUnrejectedTasksPercent,
} from '@/lib/user-contribution-report'
import type { AnnotatorContributionRow } from '@/types'
import { ContributionMetricCell } from './contribution-metric-cell'

export interface AnnotatorContributionRowProps {
  filterActive: boolean
  display: AnnotatorContributionRow
  baseline: AnnotatorContributionRow
}

export function AnnotatorContributionTableRow({
  filterActive,
  display,
  baseline,
}: AnnotatorContributionRowProps) {
  const totalAnnotated = baseline.tasks_annotated ?? baseline.total_count ?? 0
  const totalReviewed = baseline.tasks_reviewed ?? 0
  const totalFinalReviewed = baseline.tasks_final_reviewed ?? 0

  const annotatedCell: ReactNode = filterActive ? (
    <ContributionMetricCell
      count={display.tasks_annotated ?? display.total_count ?? 0}
      denominator={totalAnnotated}
      filterActive
    />
  ) : (
    <span className="tabular-nums">{totalAnnotated}</span>
  )

  const reviewedCell: ReactNode = filterActive ? (
    <ContributionMetricCell
      count={display.tasks_reviewed ?? 0}
      denominator={totalReviewed}
      filterActive
    />
  ) : (
    <span className="tabular-nums">{totalReviewed}</span>
  )

  const finalReviewedCell: ReactNode = filterActive ? (
    <ContributionMetricCell
      count={display.tasks_final_reviewed ?? 0}
      denominator={totalFinalReviewed}
      filterActive
    />
  ) : (
    <span className="tabular-nums">{totalFinalReviewed}</span>
  )

  const row = filterActive ? display : baseline

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-3 py-2">{display.username}</td>
      <td className="px-3 py-2 text-right">{annotatedCell}</td>
      <td className="px-3 py-2 text-right">{reviewedCell}</td>
      <td className="px-3 py-2 text-right">{finalReviewedCell}</td>
      <td className="px-3 py-2 text-right tabular-nums">{getSummaryRejectedCount(row)}</td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatReportPercent(getSummaryRejectedPercent(row))}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatReportPercent(getSummaryUnrejectedTasksPercent(row))}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatReportNumber(row.final_char_count)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatReportSignedNumber(row.total_char_difference)}
      </td>
      <td className="px-3 py-2 text-right tabular-nums">
        {formatReportPercent(row.char_percent_diff)}
      </td>
    </tr>
  )
}
