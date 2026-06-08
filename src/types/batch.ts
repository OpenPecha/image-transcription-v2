// Batch from list endpoint
export interface Batch {
  id: string
  name: string
  created: string
  group_id: string
  group_name: string
}

// Individual task from batch export endpoint
export type BatchExportTask = {
  file_number: string
  image_url: string
  initial_transcription: string | null
  status: BatchTaskState
  annotator_username: string | null
  annotation_transcript: string | null
  annotator_char_count: number | null
  annotation_rejection_count: number | null
  reviewer_username: string | null
  review_transcript: string | null
  reviewer_added_char: number | null
  reviewer_deleted_char: number | null
  review_rejection_count: number | null
  final_reviewer_username: string | null
  final_transcript: string | null
  final_reviewer_added_char: number | null
  final_reviewer_deleted_char: number | null
  trashed_by: string | null
}

// Response from batch export endpoint
export type BatchExportResponse = {
  batch_name: string
  tasks: BatchExportTask[]
}

// Task state for batch task view
export type BatchTaskState =
  | 'pending'
  | 'half_annotated'
  | 'annotated'
  | 'half_reviewed'
  | 'reviewed'
  | 'finalised'
  | 'trashed'

// Individual task from batch tasks endpoint
export interface BatchTask {
  task_id: string
  task_name: string
  task_url: string
  task_transcript: string
  state: BatchTaskState
  orientation?: 'landscape' | 'portrait'
  username?: string
}

// Batch with stats from report endpoint
export interface BatchReport extends Batch {
  total_tasks: number
  pending: number
  half_annotated: number
  annotated: number
  half_reviewed: number
  reviewed: number
  finalised: number
  trashed: number
}

export type ApplicationBatchReport = {
  id: string
  name: string
  created: string
  group_id: string
  total_tasks: number
  pending: number
  half_annotated: number
  annotated: number
  half_reviewed: number
  reviewed: number
  finalised: number
  trashed: number
}

// Individual task in upload JSON
export interface BatchUploadTask {
  name: string
  url: string
  transcript?: string | null
  orientation?: 'landscape' | 'portrait' | null
}

// Request payload for batch upload
export interface BatchUploadRequest {
  batch_name: string
  group_id: string
  tasks: BatchUploadTask[]
}

// Stats configuration for display
export const BATCH_STATS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-slate-100 text-slate-700',
    barColor: 'bg-slate-200',
    textColor: 'text-slate-700',
    order: 0,
  },
  half_annotated: {
    label: 'Half Annotated',
    color: 'bg-sky-100 text-sky-700',
    barColor: 'bg-sky-300',
    textColor: 'text-sky-900',
    order: 1,
  },
  annotated: {
    label: 'Annotated',
    color: 'bg-blue-100 text-blue-700',
    barColor: 'bg-indigo-500',
    textColor: 'text-white',
    order: 2,
  },
  half_reviewed: {
    label: 'Half Reviewed',
    color: 'bg-amber-50 text-amber-700',
    barColor: 'bg-amber-200',
    textColor: 'text-amber-900',
    order: 3,
  },
  reviewed: {
    label: 'Reviewed',
    color: 'bg-amber-100 text-amber-700',
    barColor: 'bg-cyan-500',
    textColor: 'text-white',
    order: 4,
  },
  finalised: {
    label: 'Finalised',
    color: 'bg-emerald-100 text-emerald-700',
    barColor: 'bg-emerald-500',
    textColor: 'text-white',
    order: 5,
  },
  trashed: {
    label: 'Trashed',
    color: 'bg-red-100 text-red-700',
    barColor: 'bg-rose-500',
    textColor: 'text-white',
    order: 6,
    isHatched: true,
  },
} as const

export type BatchStatKey = keyof typeof BATCH_STATS_CONFIG

// Workflow statuses (excluding trashed)
export const WORKFLOW_STATS: BatchStatKey[] = [
  'pending',
  'half_annotated',
  'annotated',
  'half_reviewed',
  'reviewed',
  'finalised',
]

