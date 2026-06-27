/** Per-task row from the ITV2 user contributions report endpoint. */
export interface Itv2ContributionTask {
  task_id: string
  name: string
  batch_name: string
  updated_time: string
  role: string
  order: 1 | 2 | null
  rejection_count: number
  final_char_count: number | null
  total_char_difference: number | null
  char_percent_diff: number | null
  review_char_count?: number | null
  review_total_char_difference?: number | null
  own_version_count?: number | null
  own_version_sum?: number | null
  selected_option_count?: number | null
  selected_option_sum?: number | null
  modified_option_count?: number | null
  modified_option_sum?: number | null
}

export interface Itv2AnnotatorContributionSummary {
  total_count: number
  tasks_annotated: number
  tasks_final_reviewed: number
  rejection_count: number
  unrejected_percent: number
  final_char_count: number
  total_char_difference: number
  char_percent_diff: number
}

export interface Itv2ReviewerContributionSummary {
  total_count?: number
  tasks_reviewed?: number
  rejection_count?: number
  unrejected_percent?: number
  review_char_count?: number
  review_total_char_difference?: number
  selected_option_count?: number
  own_version_count?: number
  modified_option_count?: number
}

export interface Itv2FinalReviewerContributionSummary {
  total_count: number
  tasks_finalised: number
  rejections_made: number
  rejection_percent: number
  unrejected_percent: number
  final_char_count: number
  total_char_difference: number
  char_percent_diff: number
  own_version_count: number
  own_version_sum: number
  selected_option_count: number
  selected_option_sum: number
  modified_option_count: number
  modified_option_sum: number
}

export interface Itv2ContributionSummary {
  annotator: Itv2AnnotatorContributionSummary | null
  reviewer: Itv2ReviewerContributionSummary | null
  final_reviewer: Itv2FinalReviewerContributionSummary | null
}

export interface UserContributionReportResponse {
  tasks: Itv2ContributionTask[]
  contribution_summary: Itv2ContributionSummary
}
