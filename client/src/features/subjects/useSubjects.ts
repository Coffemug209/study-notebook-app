import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { api } from '../../lib/api'
import type { Subject, ApiResponse } from '../../types'

export function useSubjects() {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchParams, setSearchParams] = useSearchParams()

  const activeSubjectId = searchParams.get('subject')

  const fetchSubjects = useCallback(async () => {
    setLoading(true)
    try {
      const res = await api.get<ApiResponse<Subject[]>>('/subjects')
      const data = res.data.data || []
      setSubjects(data)
      setError(null)

      // If active subject param is missing or not found in data, select first
      if (data.length > 0) {
        if (!activeSubjectId || !data.some((s) => s.id === activeSubjectId)) {
          setSearchParams({ subject: data[0].id }, { replace: true })
        }
      } else {
        searchParams.delete('subject')
        setSearchParams(searchParams, { replace: true })
      }
    } catch (err: unknown) {
      const errorMsg = (err as { response?: { data?: { error?: { message?: string } } }; message?: string })?.response?.data?.error?.message || (err as Error)?.message || 'Failed to load subjects'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }, [activeSubjectId, searchParams, setSearchParams])

  useEffect(() => {
    fetchSubjects()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const selectSubject = (id: string) => {
    setSearchParams({ subject: id })
  }

  const createSubject = async (name: string) => {
    const res = await api.post<ApiResponse<Subject>>('/subjects', { name })
    if (res.data.data) {
      const newSubject = res.data.data
      setSubjects((prev) => [...prev, newSubject])
      setSearchParams({ subject: newSubject.id })
      return newSubject
    }
    throw new Error('Failed to create subject')
  }

  const renameSubject = async (id: string, name: string) => {
    const res = await api.patch<ApiResponse<Subject>>(`/subjects/${id}`, { name })
    if (res.data.data) {
      const updated = res.data.data
      setSubjects((prev) => prev.map((s) => (s.id === id ? updated : s)))
      return updated
    }
    throw new Error('Failed to rename subject')
  }

  const deleteSubject = async (id: string) => {
    await api.delete(`/subjects/${id}`)
    const remaining = subjects.filter((s) => s.id !== id)
    setSubjects(remaining)
    if (activeSubjectId === id) {
      if (remaining.length > 0) {
        setSearchParams({ subject: remaining[0].id })
      } else {
        searchParams.delete('subject')
        setSearchParams(searchParams, { replace: true })
      }
    }
  }

  const moveSubject = async (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1
    if (targetIndex < 0 || targetIndex >= subjects.length) return

    const newSubjects = [...subjects]
    const [moved] = newSubjects.splice(index, 1)
    newSubjects.splice(targetIndex, 0, moved)

    setSubjects(newSubjects)
    const orderedIds = newSubjects.map((s) => s.id)
    try {
      await api.patch('/subjects/reorder', { orderedIds })
    } catch {
      // Rollback if failed
      fetchSubjects()
    }
  }

  const activeSubject = subjects.find((s) => s.id === activeSubjectId) || (subjects.length > 0 ? subjects[0] : null)

  return {
    subjects,
    activeSubject,
    activeSubjectId: activeSubject?.id || null,
    loading,
    error,
    selectSubject,
    createSubject,
    renameSubject,
    deleteSubject,
    moveSubject,
    refetch: fetchSubjects,
  }
}

export default useSubjects
