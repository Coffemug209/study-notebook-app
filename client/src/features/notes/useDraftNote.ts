import { useState, useEffect } from 'react'
import type { UploadResult } from '../../components/editor/ImageUploadDialog'

const DRAFT_STORAGE_KEY = 'study_organizer_new_note_draft'

const DEFAULT_DOC = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

interface DraftState {
  title: string
  content: Record<string, unknown>
  draftArtifacts: UploadResult[]
}

export function useDraftNote() {
  const [draft, setDraft] = useState<DraftState>(() => {
    try {
      const saved = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (saved) {
        return JSON.parse(saved)
      }
    } catch (e) {
      console.error('Failed to load draft from localStorage:', e)
    }
    return {
      title: '',
      content: DEFAULT_DOC,
      draftArtifacts: [],
    }
  })

  // Synchronize draft to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
    } catch (e) {
      console.error('Failed to save draft to localStorage:', e)
    }
  }, [draft])

  const setTitle = (title: string) => {
    setDraft((prev) => ({ ...prev, title }))
  }

  const setContent = (content: Record<string, unknown>) => {
    setDraft((prev) => ({ ...prev, content }))
  }

  const addDraftArtifact = (artifact: UploadResult) => {
    setDraft((prev) => ({
      ...prev,
      draftArtifacts: [...prev.draftArtifacts, artifact],
    }))
  }

  const clearDraft = () => {
    const freshDraft = {
      title: '',
      content: DEFAULT_DOC,
      draftArtifacts: [],
    }
    setDraft(freshDraft)
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch (e) {
      console.error('Failed to clear draft from localStorage:', e)
    }
  }

  return {
    title: draft.title,
    content: draft.content,
    draftArtifacts: draft.draftArtifacts,
    setTitle,
    setContent,
    addDraftArtifact,
    clearDraft,
  }
}

export default useDraftNote
