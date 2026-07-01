import { RejectSlotDialog, type RejectConfirmParams } from './reject-slot-dialog'

interface RejectAnnotatorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCancel: () => void
  onConfirm: (params: RejectConfirmParams) => void
  isLoading?: boolean
  taskName: string
}

export type { RejectConfirmParams }

export function RejectAnnotatorDialog(props: RejectAnnotatorDialogProps) {
  return <RejectSlotDialog variant="annotator" {...props} />
}
