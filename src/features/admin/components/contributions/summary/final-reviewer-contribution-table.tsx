import { useTranslation } from 'react-i18next'
import type { FinalReviewerContributionRow } from '@/types'
import { FinalReviewerContributionTableRow } from './final-reviewer-contribution-row'

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
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[960px] text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50 text-left">
            <th className="px-3 py-2 font-medium">
              {t('userContributions.tables.finalReviewer.username')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.finalReviewer.tasksFinalised')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.finalReviewer.rejectionsMade')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.finalReviewer.rejectionsMadePercent')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.finalReviewer.unrejectedPercent')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.finalReviewer.finalCharCount')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.finalReviewer.charDiff')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.finalReviewer.charPercentDiff')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.finalReviewer.ownVersion')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
              {t('userContributions.tables.finalReviewer.selectedOption')}
            </th>
            <th className="px-3 py-2 text-right font-medium">
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
