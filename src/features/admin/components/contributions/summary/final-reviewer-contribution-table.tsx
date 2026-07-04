import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { FinalReviewerContributionRow } from '@/types'
import { FinalReviewerContributionTableRow } from './final-reviewer-contribution-row'
import {
  contributionTableClass,
  contributionTableHeadCellClass,
  contributionTableUsernameHeadCellClass,
  contributionTableWrapperClass,
} from './contribution-table-styles'

export interface FinalReviewerContributionTableProps {
  rows: FinalReviewerContributionRow[]
  baselineByUserId: Map<string, FinalReviewerContributionRow>
  filterActive: boolean
}

export function FinalReviewerContributionTable({
  rows,
  baselineByUserId,
  filterActive,
}: FinalReviewerContributionTableProps) {
  const { t } = useTranslation('admin')

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        {t('userContributions.noFinalReviewers')}
      </p>
    )
  }

  return (
    <div className={contributionTableWrapperClass}>
      <table className={cn(contributionTableClass, 'min-w-[960px]')}>
        <thead>
          <tr className="text-left">
            <th className={cn(contributionTableUsernameHeadCellClass, 'text-left')}>
              {t('userContributions.tables.finalReviewer.username')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              {t('userContributions.tables.finalReviewer.tasksFinalised')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              {t('userContributions.tables.finalReviewer.rejectionsMade')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              {t('userContributions.tables.finalReviewer.rejectionsMadePercent')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              {t('userContributions.tables.finalReviewer.unrejectedPercent')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              {t('userContributions.tables.finalReviewer.finalCharCount')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              {t('userContributions.tables.finalReviewer.charDiff')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              {t('userContributions.tables.finalReviewer.charPercentDiff')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              {t('userContributions.tables.finalReviewer.ownVersion')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              {t('userContributions.tables.finalReviewer.selectedOption')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              {t('userContributions.tables.finalReviewer.modifiedOption')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <FinalReviewerContributionTableRow
              key={row.user_id}
              filterActive={filterActive}
              display={row}
              baseline={baselineByUserId.get(row.user_id) ?? row}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}
