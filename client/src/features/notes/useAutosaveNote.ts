import { useState, useEffect, useRef, useCallback } from 'react'
import type { Note } from '../../types'

export type SaveStatus = 'saved' | 'saving' | 'unsaved' | 'error'

interface UseAutosaveNoteOptions {
  note: Note
  onSave: (noteId: string, data: { title?: string; content?: Record<string, unknown> }) => Promise<Note>
  debounceMs?: number
}

export function useAutosaveNote({
  note,
  onSave,
  debounceMs = 1000,
}: UseAutosaveNoteOptions) {
  const [title, setTitleState] = useState(note.title)
  const [content, setContentState] = useState<Record<string, unknown> | null>(note.content)
  const [status, setStatus] = useState<SaveStatus>('saved')
  const [error, setError] = useState<string | null>(null)

  const lastSavedTitleRef = useRef(note.title)
  const lastSavedContentRef = useRef(JSON.stringify(note.content))
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const versionRef = useRef(0)
  const latestCompletedVersionRef = useRef(0)

  // Synchronize when external note id or record changes
  useEffect(() => {
    setTitleState(note.title)
    setContentState(note.content)
    lastSavedTitleRef.current = note.title
    lastSavedContentRef.current = JSON.stringify(note.content)
    setStatus('saved')
    setError(null)
  }, [note.id])

  const performSave = useCallback(
    async (targetTitle: string, targetContent: Record<string, unknown> | null) => {
      const contentString = JSON.stringify(targetContent)
      // Check if actually modified
      if (
        targetTitle === lastSavedTitleRef.current &&
        contentString === lastSavedContentRef.current
      ) {
        setStatus('saved')
        return null
      }

      const requestVersion = ++versionRef.current
      setStatus('saving')
      setError(null)

      try {
        const savedNote = await onSave(note.id, {
          title: targetTitle.trim() || 'Untitled Note',
          content: targetContent || { type: 'doc', content: [{ type: 'paragraph' }] },
        })

        // Ignore stale response if a newer save request was initiated
        if (requestVersion >= latestCompletedVersionRef.current) {
          latestCompletedVersionRef.current = requestVersion
          lastSavedTitleRef.current = targetTitle
          lastSavedContentRef.current = contentString
          setStatus('saved')
          setError(null)
        }

        return savedNote
      } catch (err: unknown) {
        if (requestVersion >= latestCompletedVersionRef.current) {
          const msg =
            (err as { response?: { data?: { error?: { message?: string } } }; message?: string })
              ?.response?.data?.error?.message ||
            (err as Error)?.message ||
            'Failed to save note'
          setError(msg)
          setStatus('error')
        }
        return null
      }
    },
    [note.id, onSave]
  )

  const scheduleSave = useCallback(
    (newTitle: string, newContent: Record<string, unknown> | null) => {
      setStatus('unsaved')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        performSave(newTitle, newContent)
      }, debounceMs)
    },
    [debounceMs, performSave]
  )

  const setTitle = (newTitle: string) => {
    setTitleState(newTitle)
    scheduleSave(newTitle, content)
  }

  const setContent = (newContent: Record<string, unknown>) => {
    setContentState(newContent)
    scheduleSave(title, newContent)
  }

  const flushSave = async () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    return performSave(title, content)
  }

  const retrySave = async () => {
    return performSave(title, content)
  }

  // Cleanup pending timer on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return {
    title,
    content,
    status,
    error,
    setTitle,
    setContent,
    flushSave,
    retrySave,
  }
}

export default useAutosaveNote
