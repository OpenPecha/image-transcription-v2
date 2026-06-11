import { useTranslation } from 'react-i18next'
import type { BatchTask } from '@/types'

interface ParticipantSlot {
  label: string
  value: string
}

interface ParticipantRows {
  row1: ParticipantSlot[]
  row2: ParticipantSlot[]
}

function hasParticipantName(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

function buildParticipantRows(
  task: BatchTask,
  labels: {
    annotator1: string
    annotator2: string
    reviewer1: string
    reviewer2: string
    finalReviewer: string
  }
): ParticipantRows | null {
  const row1: ParticipantSlot[] = []
  const row2: ParticipantSlot[] = []

  if (hasParticipantName(task.annotator_a_username)) {
    row1.push({ label: labels.annotator1, value: task.annotator_a_username })
  }
  if (hasParticipantName(task.reviewer_a_username)) {
    row1.push({ label: labels.reviewer1, value: task.reviewer_a_username })
  }
  if (hasParticipantName(task.final_reviewer_username)) {
    row1.push({ label: labels.finalReviewer, value: task.final_reviewer_username })
  }

  if (hasParticipantName(task.annotator_b_username)) {
    row2.push({ label: labels.annotator2, value: task.annotator_b_username })
  }
  if (hasParticipantName(task.reviewer_b_username)) {
    row2.push({ label: labels.reviewer2, value: task.reviewer_b_username })
  }

  if (row1.length === 0 && row2.length === 0) return null
  return { row1, row2 }
}

function ParticipantCell({ label, value }: ParticipantSlot) {
  return (
    <div className="min-w-0">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function ParticipantRow({ slots }: { slots: ParticipantSlot[] }) {
  if (slots.length === 0) return null

  return (
    <div className="grid grid-cols-3 gap-x-6 gap-y-1">
      {slots.map((slot) => (
        <ParticipantCell key={slot.label} label={slot.label} value={slot.value} />
      ))}
    </div>
  )
}

interface TaskParticipantsBarProps {
  task: BatchTask
}

export function TaskParticipantsBar({ task }: TaskParticipantsBarProps) {
  const { t } = useTranslation('admin')

  if (task.state === 'trashed') {
    if (!hasParticipantName(task.trashed_by)) return null

    return (
      <div className="flex-shrink-0 border-t border-border bg-muted/30 px-4 py-2.5">
        <p className="text-sm">
          <span className="text-muted-foreground">{t('batches.trashedBy')}: </span>
          <span className="font-medium text-foreground">{task.trashed_by}</span>
        </p>
      </div>
    )
  }

  const rows = buildParticipantRows(task, {
    annotator1: t('batches.participants.annotator1'),
    annotator2: t('batches.participants.annotator2'),
    reviewer1: t('batches.participants.reviewer1'),
    reviewer2: t('batches.participants.reviewer2'),
    finalReviewer: t('batches.participants.finalReviewer'),
  })

  if (!rows) return null

  return (
    <div className="flex-shrink-0 space-y-2 border-t border-border bg-muted/30 px-4 py-2.5">
      <ParticipantRow slots={rows.row1} />
      <ParticipantRow slots={rows.row2} />
    </div>
  )
}
