import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface AdminContributionsDateFilterProps {
  inputIdPrefix: string
  draftStart: string
  draftEnd: string
  onDraftStartChange: (value: string) => void
  onDraftEndChange: (value: string) => void
  onApply: () => void
  validationError: string | null
}

export function AdminContributionsDateFilter({
  inputIdPrefix,
  draftStart,
  draftEnd,
  onDraftStartChange,
  onDraftEndChange,
  onApply,
  validationError,
}: AdminContributionsDateFilterProps) {
  const { t } = useTranslation('admin')
  const startId = `${inputIdPrefix}-start`
  const endId = `${inputIdPrefix}-end`

  return (
    <div className="rounded-lg border border-border bg-muted/30 p-4">
      <p className="mb-3 text-sm font-medium">{t('userContributions.dateFilterTitleGroup')}</p>
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
        <div className="min-w-[10rem] flex-1 space-y-1.5">
          <Label htmlFor={startId} className="text-xs">
            {t('userContributions.startDateInclusive')}
          </Label>
          <Input
            id={startId}
            type="date"
            value={draftStart}
            onChange={(e) => onDraftStartChange(e.target.value)}
          />
        </div>
        <div className="min-w-[10rem] flex-1 space-y-1.5">
          <Label htmlFor={endId} className="text-xs">
            {t('userContributions.endDateInclusive')}
          </Label>
          <Input
            id={endId}
            type="date"
            value={draftEnd}
            onChange={(e) => onDraftEndChange(e.target.value)}
          />
        </div>
        <Button type="button" onClick={onApply}>
          {t('userContributions.apply')}
        </Button>
      </div>
      {validationError ? (
        <p className="mt-2 text-sm text-destructive">{validationError}</p>
      ) : null}
    </div>
  )
}
