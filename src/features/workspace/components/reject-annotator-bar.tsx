import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface RejectAnnotatorBarProps {
  onOpen: () => void
  disabled?: boolean
  className?: string
}

export function RejectAnnotatorBar({ onOpen, disabled = false, className }: RejectAnnotatorBarProps) {
  const { t } = useTranslation('workspace')

  return (
    <Button
      type="button"
      variant="destructive"
      disabled={disabled}
      className={cn(className)}
      onClick={onOpen}
    >
      {t('actions.reject')}
    </Button>
  )
}
