import type {
  Itv2AnnotatorContributionSummary,
  Itv2ContributionSummary,
  Itv2FinalReviewerContributionSummary,
  Itv2ReviewerContributionSummary,
  UserContributionReportResponse,
} from '@/types/user-contribution-report'
import { UserRole, normalizeUserRole } from '@/types/user'

export type Itv2ReportRoleSummary =
  | Itv2AnnotatorContributionSummary
  | Itv2ReviewerContributionSummary
  | Itv2FinalReviewerContributionSummary

export function getContributionSummaryForRole(
  summary: Itv2ContributionSummary | undefined,
  role: UserRole | string | undefined
): Itv2ReportRoleSummary | null {
  if (!summary) return null

  const normalized = normalizeUserRole(role)
  if (normalized === UserRole.Annotator) return summary.annotator
  if (normalized === UserRole.Reviewer) return summary.reviewer
  if (normalized === UserRole.FinalReviewer) return summary.final_reviewer
  return null
}

export function emptyContributionReport(): UserContributionReportResponse {
  return {
    tasks: [],
    contribution_summary: {
      annotator: null,
      reviewer: null,
      final_reviewer: null,
    },
  }
}

export function formatReportNumber(value: number | null | undefined): string {
  if (value == null) return '—'
  return value.toLocaleString()
}

export function formatReportSignedNumber(value: number | null | undefined): string {
  if (value == null) return '—'
  const prefix = value > 0 ? '+' : ''
  return `${prefix}${value.toLocaleString()}`
}

export function formatReportPercent(value: number | null | undefined): string {
  if (value == null) return '—'
  return `${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}%`
}

export function formatReportCountSum(
  count: number | null | undefined,
  sum: number | null | undefined
): string {
  if (count == null && sum == null) return '—'
  return `${formatReportNumber(count ?? 0)} / ${formatReportNumber(sum ?? 0)}`
}

export function getContributionSlotLabelKey(
  role: UserRole | string | undefined,
  order: 1 | 2 | null
): 'annotatorA' | 'annotatorB' | 'reviewerA' | 'reviewerB' {
  if (order == null) {
    return 'reviewerA'
  }

  const normalized = normalizeUserRole(role)
  if (normalized === UserRole.Reviewer) {
    return order === 1 ? 'reviewerA' : 'reviewerB'
  }
  if (normalized === UserRole.FinalReviewer) {
    return order === 1 ? 'reviewerA' : 'reviewerB'
  }
  return order === 1 ? 'annotatorA' : 'annotatorB'
}
