import { useTranslation } from 'react-i18next'
import { Ban } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { RejectTarget } from '../types/reject-target'
import {
  REJECT_TARGET_ANNOTATOR_A,
  REJECT_TARGET_ANNOTATOR_B,
  REJECT_TARGET_BOTH,
} from '../types/reject-target'

interface RejectAnnotatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onSelectTarget: (target: RejectTarget) => void
  isLoading?: boolean
  taskName: string
}

const REJECT_OPTIONS: Array<{ target: RejectTarget; labelKey: string; destructive?: boolean }> = [
  { target: REJECT_TARGET_ANNOTATOR_A, labelKey: 'actions.rejectAnnotatorA' },
  { target: REJECT_TARGET_ANNOTATOR_B, labelKey: 'actions.rejectAnnotatorB' },
  { target: REJECT_TARGET_BOTH, labelKey: 'actions.rejectBoth', destructive: true },
]

export function RejectAnnotatorDialog({
  open,
  onOpenChange,
  onCancel,
  onSelectTarget,
  isLoading = false,
  taskName,
}: RejectAnnotatorDialogProps) {
  const { t } = useTranslation('workspace')
  const { t: tCommon } = useTranslation('common')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/20">
              <Ban className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>{t('dialogs.reject.choose.title')}</DialogTitle>
              <DialogDescription className="mt-1">
                {t('dialogs.reject.choose.description', { taskName })}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="flex-col gap-2 sm:flex-col sm:space-x-0">
          <Button variant="outline" onClick={onCancel} disabled={isLoading} className="w-full">
            {tCommon('actions.cancel')}
          </Button>
          {REJECT_OPTIONS.map(({ target, labelKey, destructive }) => (
            <Button
              key={target}
              variant={destructive ? 'destructive' : 'outline'}
              disabled={isLoading}
              className={cn('w-full', !destructive && 'border-destructive/30 text-destructive hover:bg-destructive/10')}
              onClick={() => onSelectTarget(target)}
            >
              {t(labelKey)}
            </Button>
          ))}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
