import { useTranslation } from 'react-i18next'
import type { ReviewerContributionRow } from '@/types'
import { ReviewerContributionTableRow } from './reviewer-contribution-row'

export interface ReviewerContributionTableProps {
  rows: ReviewerContributionRow[]
  baselineByUserId: Map<string, ReviewerContributionRow>
  filterActive: boolean
}

export function ReviewerContributionTable({
  rows,
  baselineByUserId,
  filterActive,
}: ReviewerContributionTableProps) {
  const { t } = useTranslation('admin')

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        {t('userContributions.noReviewers')}
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[1200px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            <th className="px-3 py-2 font-medium">
              {t('userContributions.tables.reviewer.username')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.tasksReviewed')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.tasksFinalReviewed')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.rejectedCount')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.rejectedPercent')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.unrejectedPercent')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.reviewCharCount')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.reviewCharDiff')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.finalCharCount')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.charDiff')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.charPercentDiff')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.rejectionsMade')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.rejectionsMadePercent')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.ownVersion')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.selectedOption')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.reviewer.modifiedOption')}
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <ReviewerContributionTableRow
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
