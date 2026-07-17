import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { ReviewerContributionRow } from '@/types'
import { ContributionHintLabel } from './contribution-hint-label'
import { ReviewerContributionTableRow } from './reviewer-contribution-row'
import {
  contributionTableClass,
  contributionTableHeadCellClass,
  contributionTableUsernameHeadCellClass,
  contributionTableWrapperClass,
} from './contribution-table-styles'

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
    <div className={contributionTableWrapperClass}>
      <table className={cn(contributionTableClass, 'min-w-[1280px]')}>
        <thead>
          <tr className="text-left">
            <th className={cn(contributionTableUsernameHeadCellClass, 'text-left')}>
              {t('userContributions.tables.reviewer.username')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.tasksReviewed')}>
                {t('userContributions.tables.reviewer.tasksReviewed')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.tasksReviewedAsR1')}>
                {t('userContributions.tables.reviewer.tasksReviewedAsR1')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.tasksFinalReviewed')}>
                {t('userContributions.tables.reviewer.tasksFinalReviewed')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.rejectionCountReviewer')}>
                {t('userContributions.tables.reviewer.rejectedCount')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.rejectedPercentReviewer')}>
                {t('userContributions.tables.reviewer.rejectedPercent')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.unrejectedPercentReviewer')}>
                {t('userContributions.tables.reviewer.unrejectedPercent')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.reviewCharCountSummary')}>
                {t('userContributions.tables.reviewer.reviewCharCount')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.reviewCharDiffSummary')}>
                {t('userContributions.tables.reviewer.reviewCharDiff')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.finalCharCountSummary')}>
                {t('userContributions.tables.reviewer.finalCharCount')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.charDiffSummary')}>
                {t('userContributions.tables.reviewer.charDiff')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.charPercentDiffSummary')}>
                {t('userContributions.tables.reviewer.charPercentDiff')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.rejectionsMadeSummaryReviewer')}>
                {t('userContributions.tables.reviewer.rejectionsMade')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.rejectionsMadePercentReviewer')}>
                {t('userContributions.tables.reviewer.rejectionsMadePercent')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.ownVersion')}>
                {t('userContributions.tables.reviewer.ownVersion')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.selectedOption')}>
                {t('userContributions.tables.reviewer.selectedOption')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.modifiedOption')}>
                {t('userContributions.tables.reviewer.modifiedOption')}
              </ContributionHintLabel>
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
