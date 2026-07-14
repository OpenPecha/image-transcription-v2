import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { AnnotatorContributionRow } from '@/types'
import { AnnotatorContributionTableRow } from './annotator-contribution-row'
import { ContributionHintLabel } from './contribution-hint-label'
import {
  contributionTableClass,
  contributionTableHeadCellClass,
  contributionTableUsernameHeadCellClass,
  contributionTableWrapperClass,
} from './contribution-table-styles'

export interface AnnotatorContributionTableProps {
  rows: AnnotatorContributionRow[]
  baselineByUserId: Map<string, AnnotatorContributionRow>
  filterActive: boolean
}

export function AnnotatorContributionTable({
  rows,
  baselineByUserId,
  filterActive,
}: AnnotatorContributionTableProps) {
  const { t } = useTranslation('admin')

  if (rows.length === 0) {
    return (
      <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        {t('userContributions.noAnnotators')}
      </p>
    )
  }

  return (
    <div className={contributionTableWrapperClass}>
      <table className={cn(contributionTableClass, 'min-w-[960px]')}>
        <thead>
          <tr className="text-left">
            <th className={cn(contributionTableUsernameHeadCellClass, 'text-left')}>
              {t('userContributions.tables.annotator.username')}
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.tasksAnnotated')}>
                {t('userContributions.tables.annotator.tasksAnnotated')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.tasksReviewed')}>
                {t('userContributions.tables.annotator.tasksReviewed')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.tasksFinalReviewed')}>
                {t('userContributions.tables.annotator.tasksFinalReviewed')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.rejectionCountAnnotator')}>
                {t('userContributions.tables.annotator.rejectedCount')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.rejectedPercentAnnotator')}>
                {t('userContributions.tables.annotator.rejectedPercent')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.unrejectedPercentAnnotator')}>
                {t('userContributions.tables.annotator.unrejectedPercent')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.finalCharCountSummary')}>
                {t('userContributions.tables.annotator.finalCharCount')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.charDiffSummary')}>
                {t('userContributions.tables.annotator.charDiff')}
              </ContributionHintLabel>
            </th>
            <th className={cn(contributionTableHeadCellClass, 'text-right')}>
              <ContributionHintLabel hint={t('users.report.hints.charPercentDiffSummary')}>
                {t('userContributions.tables.annotator.charPercentDiff')}
              </ContributionHintLabel>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <AnnotatorContributionTableRow
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
