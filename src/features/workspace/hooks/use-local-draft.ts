import { useEffect, useCallback, useRef } from 'react'

import { useDebouncedValue } from '@/hooks'

export const TEXT_DRAFT_KEY_PREFIX = 'draft_task_'

const getTextDraftKey = (taskId: string) => `${TEXT_DRAFT_KEY_PREFIX}${taskId}`

export function loadTextDraft(taskId: string): string | null {
  try {
    const stored = localStorage.getItem(getTextDraftKey(taskId))
    if (!stored) return null
    const data: DraftData = JSON.parse(stored)
    return data.text
  } catch (error) {
    console.error('Failed to load draft from localStorage:', error)
    return null
  }
}

/** Returns a saved draft only when it contains non-whitespace content. */
export function loadNonEmptyTextDraft(taskId: string): string | null {
  const draft = loadTextDraft(taskId)
  return draft?.trim() ? draft : null
}

interface DraftData {
  text: string
  timestamp: number
}

interface UseLocalDraftOptions {
  taskId: string | null
  text: string
  delay?: number
  /** When false, skips auto-save (e.g. reviewer diff-resolution mode uses diff draft only). */
  enabled?: boolean
}

interface UseLocalDraftReturn {
  clearDraft: () => void
}

/**
 * Hook to auto-save editor drafts to localStorage
 * - Debounces saves to avoid excessive writes
 * - Automatically loads drafts when task changes
 * - Provides clearDraft for cleanup on submit/approve/trash
 */
export function useLocalDraft({
  taskId,
  text,
  delay = 500,
  enabled = true,
}: UseLocalDraftOptions): UseLocalDraftReturn {
  const debouncedText = useDebouncedValue(text, delay)

  // Track the taskId we last saved for to prevent saving stale text on task change
  const lastSavedTaskIdRef = useRef<string | null>(null)

  const saveDraft = useCallback((id: string, content: string) => {
    try {
      const data: DraftData = {
        text: content,
        timestamp: Date.now(),
      }
      localStorage.setItem(getTextDraftKey(id), JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save draft to localStorage:', error)
    }
  }, [])

  const clearDraft = useCallback(() => {
    if (!taskId) return
    try {
      localStorage.removeItem(getTextDraftKey(taskId))
    } catch (error) {
      console.error('Failed to clear draft from localStorage:', error)
    }
  }, [taskId])

  // Single unified effect for auto-save
  useEffect(() => {
    // Guard: no task to save for
    if (!taskId || !enabled) {
      lastSavedTaskIdRef.current = null
      return
    }

    // Guard: task just changed — skip this cycle to avoid saving stale debounced text
    if (lastSavedTaskIdRef.current !== taskId) {
      lastSavedTaskIdRef.current = taskId
      return
    }
    // Safe to save: same task, debounced text has settled
    saveDraft(taskId, debouncedText)
  }, [taskId, debouncedText, saveDraft, enabled])

  return {
    clearDraft,
  }
}
