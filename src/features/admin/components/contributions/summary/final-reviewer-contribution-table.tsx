import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { FinalReviewerContributionRow } from '@/types'
import { ContributionHintLabel } from './contribution-hint-label'
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
              <ContributionHintLabel hint={t('users.report.hints.tasksFinalised')}>
                {t('userContributions.tables.finalReviewer.tasksFinalised')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.rejectionsMadeSummaryFinalReviewer')}>
                {t('userContributions.tables.finalReviewer.rejectionsMade')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.rejectionsMadePercentFinalReviewer')}>
                {t('userContributions.tables.finalReviewer.rejectionsMadePercent')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.unrejectedPercentFinalReviewer')}>
                {t('userContributions.tables.finalReviewer.unrejectedPercent')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.finalCharCountSummary')}>
                {t('userContributions.tables.finalReviewer.finalCharCount')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.charDiffSummary')}>
                {t('userContributions.tables.finalReviewer.charDiff')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.charPercentDiffSummary')}>
                {t('userContributions.tables.finalReviewer.charPercentDiff')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.ownVersion')}>
                {t('userContributions.tables.finalReviewer.ownVersion')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.selectedOption')}>
                {t('userContributions.tables.finalReviewer.selectedOption')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.modifiedOption')}>
                {t('userContributions.tables.finalReviewer.modifiedOption')}
              </ContributionHintLabel>
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
