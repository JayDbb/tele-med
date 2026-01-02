import { useEffect, useRef, useCallback } from 'react'
import { PatientDataManager } from '@/utils/PatientDataManager'

interface UseAutosaveOptions {
  enabled?: boolean
  debounceMs?: number
  onSave?: (data: any) => void
  onRestore?: (data: any) => void
}

/**
 * Custom hook for autosaving form data to localStorage
 * Automatically saves form state, restores on mount, and clears on successful submit
 * 
 * @param formKey - Unique key for this form (e.g., 'past-medical-history-form')
 * @param formData - The form data to autosave
 * @param patientId - Optional patient ID for scoping drafts
 * @param options - Configuration options
 * @returns Object with clearDraft function to call after successful submit
 */
export function useAutosave<T extends Record<string, any>>(
  formKey: string,
  formData: T,
  patientId?: string,
  options: UseAutosaveOptions = {}
) {
  const {
    enabled = true,
    debounceMs = 1000,
    onSave,
    onRestore
  } = options

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isRestoringRef = useRef(false)
  const hasRestoredRef = useRef(false)

  // Clear draft function to call after successful submit
  const clearDraft = useCallback(() => {
    if (patientId) {
      PatientDataManager.clearDraft(patientId, formKey)
    } else {
      try {
        localStorage.removeItem(`form-draft-${formKey}`)
      } catch (error) {
        console.error('Error clearing draft:', error)
      }
    }
  }, [formKey, patientId])

  // Restore draft on mount
  useEffect(() => {
    if (!enabled || hasRestoredRef.current) return

    try {
      let draft: any = null
      
      if (patientId) {
        draft = PatientDataManager.getDraft(patientId, formKey)
      } else {
        const draftData = localStorage.getItem(`form-draft-${formKey}`)
        if (draftData) {
          draft = JSON.parse(draftData)
        }
      }

      if (draft?.data) {
        isRestoringRef.current = true
        hasRestoredRef.current = true
        
        if (onRestore) {
          onRestore(draft.data)
        }
        
        // Small delay to ensure state updates are processed
        setTimeout(() => {
          isRestoringRef.current = false
        }, 100)
      }
    } catch (error) {
      console.error('Error restoring draft:', error)
    }
  }, [formKey, patientId, enabled, onRestore])

  // Autosave form data
  useEffect(() => {
    if (!enabled || isRestoringRef.current) return

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current)
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      try {
        const dataToSave = { ...formData }
        
        if (patientId) {
          PatientDataManager.saveDraft(patientId, formKey, dataToSave)
        } else {
          localStorage.setItem(
            `form-draft-${formKey}`,
            JSON.stringify({
              data: dataToSave,
              updatedAt: new Date().toISOString()
            })
          )
        }

        if (onSave) {
          onSave(dataToSave)
        }
      } catch (error) {
        console.error('Error autosaving form:', error)
      }
    }, debounceMs)

    // Cleanup timeout on unmount
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current)
      }
    }
  }, [formData, formKey, patientId, enabled, debounceMs, onSave])

  return {
    clearDraft,
    isRestoring: isRestoringRef.current
  }
}

