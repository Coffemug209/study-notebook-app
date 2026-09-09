import { useState, useEffect, useCallback } from 'react'
import { api } from '../../lib/api'
import type { Note, ApiResponse } from '../../types'

export function useNotes(subjectId: string | null) {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchNotes = useCallback(async () => {
    if (!subjectId) {
      setNotes([])
      return
    }

    setLoading(true)
    try {
      const res = await api.get<ApiResponse<Note[]>>(`/subjects/${subjectId}/notes`)
      const data = res.data.data || []
      // Sort newest updated first
      const sorted = [...data].sort(
        (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      )
      setNotes(sorted)
      setError(null)
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { error?: { message?: string } } }; message?: string })
          ?.response?.data?.error?.message ||
        (err as Error)?.message ||
        'Failed to load notes'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [subjectId])

  useEffect(() => {
    fetchNotes()
  }, [fetchNotes])

  const createNote = async (
    title = 'Untitled Note',
    content: Record<string, unknown> = {
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
    }
  ) => {
    if (!subjectId) throw new Error('No active subject selected')

    const res = await api.post<ApiResponse<Note>>(`/subjects/${subjectId}/notes`, {
      title,
      content,
    })

    if (res.data.data) {
      const newNote = res.data.data
      setNotes((prev) => [newNote, ...prev])
      return newNote
    }
    throw new Error('Failed to create note')
  }

  const updateNote = async (
    noteId: string,
    data: { title?: string; content?: Record<string, unknown> }
  ) => {
    const res = await api.patch<ApiResponse<Note>>(`/notes/${noteId}`, data)
    if (res.data.data) {
      const updated = res.data.data
      setNotes((prev) => {
        const remaining = prev.filter((n) => n.id !== noteId)
        return [updated, ...remaining]
      })
      return updated
    }
    throw new Error('Failed to update note')
  }

  const deleteNote = async (noteId: string) => {
    await api.delete(`/notes/${noteId}`)
    setNotes((prev) => prev.filter((n) => n.id !== noteId))
  }

  return {
    notes,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    refetch: fetchNotes,
  }
}

export default useNotes
