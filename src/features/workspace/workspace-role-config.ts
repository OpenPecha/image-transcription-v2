import {
  UserRole,
  ITV2_REVIEWER_APPROVABLE_STATES,
  ITV2_FINAL_REVIEWER_APPROVABLE_STATES,
  normalizeUserRole,
} from '@/types'
import type { AssignedTaskState } from '@/types'

/**
 * When true, Final Reviewer mirrors Reviewer workspace behavior (UI + API).
 * Set to false and customize FINAL_REVIEWER_CAPS when the workflow diverges.
 */
export const FINAL_REVIEWER_SHARES_REVIEWER_WORKFLOW = true

export function isAnnotatorRole(role: UserRole | string | undefined): boolean {
  return normalizeUserRole(role) === UserRole.Annotator
}

export function isReviewerRole(role: UserRole | string | undefined): boolean {
  return normalizeUserRole(role) === UserRole.Reviewer
}

export function isFinalReviewerRole(role: UserRole | string | undefined): boolean {
  return normalizeUserRole(role) === UserRole.FinalReviewer
}

export interface WorkspaceRoleCaps {
  usesReviewerTranscript: boolean
  usesDiffResolver: boolean
  usesApproveAction: boolean
  dictionaryEnabled: boolean
}

const ANNOTATOR_CAPS: WorkspaceRoleCaps = {
  usesReviewerTranscript: false,
  usesDiffResolver: false,
  usesApproveAction: false,
  dictionaryEnabled: true,
}

const REVIEWER_CAPS: WorkspaceRoleCaps = {
  usesReviewerTranscript: true,
  usesDiffResolver: true,
  usesApproveAction: true,
  dictionaryEnabled: true,
}

/** Final Reviewer caps when FINAL_REVIEWER_SHARES_REVIEWER_WORKFLOW is false. */
const FINAL_REVIEWER_CAPS: WorkspaceRoleCaps = {
  usesReviewerTranscript: true,
  usesDiffResolver: true,
  usesApproveAction: true,
  dictionaryEnabled: true,
}

export function getWorkspaceRoleCaps(role: UserRole | string | undefined): WorkspaceRoleCaps | null {
  const normalized = normalizeUserRole(role)
  if (isAnnotatorRole(normalized)) return ANNOTATOR_CAPS
  if (isReviewerRole(normalized)) return REVIEWER_CAPS
  if (isFinalReviewerRole(normalized)) {
    return FINAL_REVIEWER_SHARES_REVIEWER_WORKFLOW ? { ...REVIEWER_CAPS } : { ...FINAL_REVIEWER_CAPS }
  }
  return null
}

/** Whether a reviewer-role user may approve/submit the assigned task in this state. */
export function isApprovableTaskState(
  state: AssignedTaskState,
  role: UserRole | string | undefined
): boolean {
  if (isFinalReviewerRole(role)) {
    return (ITV2_FINAL_REVIEWER_APPROVABLE_STATES as readonly string[]).includes(state)
  }
  if (isReviewerRole(role)) {
    return (ITV2_REVIEWER_APPROVABLE_STATES as readonly string[]).includes(state)
  }
  return false
}
