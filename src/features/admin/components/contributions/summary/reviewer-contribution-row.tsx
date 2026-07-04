import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  formatReportCountSum,
  formatReportNumber,
  formatReportPercent,
  formatReportSignedNumber,
  getSummaryRejectedCount,
  getSummaryRejectedPercent,
  getSummaryRejectionsMadeCount,
  getSummaryRejectionsMadePercent,
  getSummaryUnrejectedTasksPercent,
} from '@/lib/user-contribution-report'
import type { ReviewerContributionRow } from '@/types'
import { ContributionMetricCell } from './contribution-metric-cell'
import { contributionTableBodyCellClass, contributionTableUsernameBodyCellClass } from './contribution-table-styles'

export interface ReviewerContributionRowProps {
  filterActive: boolean
  display: ReviewerContributionRow
  baseline: ReviewerContributionRow
}

export function ReviewerContributionTableRow({
  filterActive,
  display,
  baseline,
}: ReviewerContributionRowProps) {
  const totalReviewed = baseline.tasks_reviewed ?? baseline.total_count ?? 0
  const totalFinalReviewed = baseline.tasks_final_reviewed ?? 0

  const reviewedCell: ReactNode = filterActive ? (
    <ContributionMetricCell
      count={display.tasks_reviewed ?? display.total_count ?? 0}
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
    <tr>
      <td className={contributionTableUsernameBodyCellClass} title={display.username}>
        {display.username}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right')}>{reviewedCell}</td>
      <td className={cn(contributionTableBodyCellClass, 'text-right')}>{finalReviewedCell}</td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>{getSummaryRejectedCount(row)}</td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportPercent(getSummaryRejectedPercent(row))}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportPercent(getSummaryUnrejectedTasksPercent(row))}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportNumber(row.review_char_count)}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportSignedNumber(row.review_total_char_difference)}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportNumber(row.final_char_count)}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportSignedNumber(row.total_char_difference)}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportPercent(row.char_percent_diff)}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {getSummaryRejectionsMadeCount(row)}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportPercent(getSummaryRejectionsMadePercent(row))}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportCountSum(row.own_version_count, row.own_version_sum)}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportCountSum(row.selected_option_count, row.selected_option_sum)}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportCountSum(row.modified_option_count, row.modified_option_sum)}
      </td>
    </tr>
  )
}
