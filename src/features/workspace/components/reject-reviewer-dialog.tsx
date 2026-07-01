import { RejectSlotDialog, type RejectConfirmParams } from './reject-slot-dialog'

interface RejectReviewerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onConfirm: (params: RejectConfirmParams) => void
  isLoading?: boolean
  taskName: string
}

export function RejectReviewerDialog(props: RejectReviewerDialogProps) {
  return <RejectSlotDialog variant="reviewer" {...props} />
}

export type { RejectConfirmParams }
