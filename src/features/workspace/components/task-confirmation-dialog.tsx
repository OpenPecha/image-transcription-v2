import type { LucideIcon } from 'lucide-react'
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

interface TaskConfirmationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
  title: string
  description: string
  confirmLabel: string
  cancelLabel: string
  loadingLabel?: string
  variant?: 'success' | 'destructive'
  icon: LucideIcon
}

export function TaskConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  isLoading = false,
  title,
  description,
  confirmLabel,
  cancelLabel,
  loadingLabel = 'Processing...',
  variant = 'success',
  icon: Icon,
}: TaskConfirmationDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-full',
                variant === 'success' ? 'bg-success/20' : 'bg-destructive/20'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5',
                  variant === 'success' ? 'text-success' : 'text-destructive'
                )}
              />
            </div>
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription className="mt-1">{description}</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onCancel} disabled={isLoading}>
            {cancelLabel}
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={isLoading}>
            {isLoading ? loadingLabel : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
