import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useQueryClient } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { getDefaultMonthToDateRange } from '@/lib/contribution-date-range'
import { getContributionSummaryErrorMessage } from '@/lib/contribution-summary-error'
import {
  contributionKeys,
  useGroupContributionSummaryFiltered,
} from '@/features/admin/api/contributions'
import { AdminContributionsDateFilter } from './admin-contributions-date-filter'
import { ContributionSummaryTables } from './summary'

export interface AdminGroupContributionRowProps {
  groupId: string
  groupName: string
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  appliedPeriod: { start: string; end: string } | undefined
  onApplyPeriod: (period: { start: string; end: string }) => void
}

export function AdminGroupContributionRow({
  groupId,
  groupName,
  isOpen,
  onOpenChange,
  appliedPeriod,
  onApplyPeriod,
}: AdminGroupContributionRowProps) {
  const { t } = useTranslation('admin')
  const queryClient = useQueryClient()

  const monthDefault = useMemo(() => getDefaultMonthToDateRange(), [])

  const [draftStart, setDraftStart] = useState(monthDefault.start)
  const [draftEnd, setDraftEnd] = useState(monthDefault.end)
  const [validationError, setValidationError] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    if (appliedPeriod) {
      setDraftStart(appliedPeriod.start)
      setDraftEnd(appliedPeriod.end)
      return
    }
    setDraftStart(monthDefault.start)
    setDraftEnd(monthDefault.end)
    onApplyPeriod(monthDefault)
  }, [isOpen, appliedPeriod, monthDefault, onApplyPeriod])

  const invalidateThisGroup = useCallback(() => {
    void queryClient.invalidateQueries({
      queryKey: contributionKeys.summaryPairsForGroup(groupId),
    })
  }, [groupId, queryClient])

  const handleApply = useCallback(() => {
    if (!draftStart || !draftEnd) {
      setValidationError(t('userContributions.validationDatesRequired'))
      return
    }
    if (draftStart > draftEnd) {
      setValidationError(t('userContributions.validationStartBeforeEnd'))
      return
    }
    setValidationError(null)
    onApplyPeriod({ start: draftStart, end: draftEnd })
    invalidateThisGroup()
  }, [draftEnd, draftStart, invalidateThisGroup, onApplyPeriod, t])

  const filteredQuery = useGroupContributionSummaryFiltered({
    groupId,
    period: appliedPeriod ?? monthDefault,
    enabled: isOpen && Boolean(appliedPeriod),
  })

  const inputIdPrefix = useMemo(
    () => `contrib-group-${groupId.replace(/[^a-zA-Z0-9-]/g, '')}`,
    [groupId]
  )

  const showLoading =
    filteredQuery.isLoading || (filteredQuery.isFetching && !filteredQuery.data)

  const dateFilterBlock = (
    <AdminContributionsDateFilter
      inputIdPrefix={inputIdPrefix}
      draftStart={draftStart}
      draftEnd={draftEnd}
      onDraftStartChange={setDraftStart}
      onDraftEndChange={setDraftEnd}
      onApply={handleApply}
      validationError={validationError}
    />
  )

  return (
    <div className="rounded-lg border border-border bg-card">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/40"
        onClick={() => onOpenChange(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-medium">{groupName}</span>
        <ChevronDown
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', isOpen && 'rotate-180')}
        />
      </button>

      {isOpen ? (
        <div className="space-y-4 border-t border-border px-4 py-4">
          {showLoading ? (
            <div className="space-y-3">
              {dateFilterBlock}
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          ) : filteredQuery.error ? (
            <>
              {dateFilterBlock}
              <div className="rounded-lg border border-dashed p-4 text-center">
                <p className="text-sm text-muted-foreground">
                  {getContributionSummaryErrorMessage(filteredQuery.error, t)}
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => void filteredQuery.refetch()}
                >
                  {t('userContributions.refresh')}
                </Button>
              </div>
            </>
          ) : filteredQuery.data ? (
            <>
              {dateFilterBlock}
              <ContributionSummaryTables
                baseline={filteredQuery.data}
                filtered={filteredQuery.data}
                filterActive={false}
              />
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
