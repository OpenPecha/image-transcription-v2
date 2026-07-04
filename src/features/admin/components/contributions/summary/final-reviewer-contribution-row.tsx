import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import {
  formatReportCountSum,
  formatReportNumber,
  formatReportPercent,
  formatReportSignedNumber,
  getSummaryRejectionsMadeCount,
  getSummaryRejectionsMadePercent,
  getSummaryUnrejectedTasksPercent,
} from '@/lib/user-contribution-report'
import type { FinalReviewerContributionRow } from '@/types'
import { ContributionMetricCell } from './contribution-metric-cell'
import { contributionTableBodyCellClass, contributionTableUsernameBodyCellClass } from './contribution-table-styles'

export interface FinalReviewerContributionRowProps {
  filterActive: boolean
  display: FinalReviewerContributionRow
  baseline: FinalReviewerContributionRow
}

export function FinalReviewerContributionTableRow({
  filterActive,
  display,
  baseline,
}: FinalReviewerContributionRowProps) {
  const totalFinalised = baseline.tasks_finalised ?? baseline.total_count ?? 0

  const finalisedCell: ReactNode = filterActive ? (
    <ContributionMetricCell
      count={display.tasks_finalised ?? display.total_count ?? 0}
      denominator={totalFinalised}
      filterActive
    />
  ) : (
    <span className="tabular-nums">{totalFinalised}</span>
  )

  const row = filterActive ? display : baseline

  return (
    <tr>
      <td className={contributionTableUsernameBodyCellClass} title={display.username}>
        {display.username}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right')}>{finalisedCell}</td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {getSummaryRejectionsMadeCount(row)}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportPercent(getSummaryRejectionsMadePercent(row))}
      </td>
      <td className={cn(contributionTableBodyCellClass, 'text-right tabular-nums')}>
        {formatReportPercent(getSummaryUnrejectedTasksPercent(row))}
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
