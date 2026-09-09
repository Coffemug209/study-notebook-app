import React, { useState, useEffect } from 'react'
import { X, Folder, Plus, Loader2, Check } from 'lucide-react'
import { api } from '../../lib/api'
import type { Subject, ApiResponse } from '../../types'

interface SubjectSelectDialogProps {
  isOpen: boolean
  onClose: () => void
  onSelectSubject: (subjectId: string) => Promise<void>
}

export function SubjectSelectDialog({
  isOpen,
  onClose,
  onSelectSubject,
}: SubjectSelectDialogProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Quick create inline state
  const [isCreatingNew, setIsCreatingNew] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState('')
  const [creatingSubject, setCreatingSubject] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setLoading(true)
      setError(null)
      api.get<ApiResponse<Subject[]>>('/subjects')
        .then((res) => {
          const data = res.data.data || []
          setSubjects(data)
          if (data.length > 0 && !selectedId) {
            setSelectedId(data[0].id)
          }
        })
        .catch((err) => {
          setError(err.message || 'Failed to load subjects')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }, [isOpen, selectedId])

  if (!isOpen) return null

  const handleCreateSubject = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubjectName.trim()) return

    setCreatingSubject(true)
    try {
      const res = await api.post<ApiResponse<Subject>>('/subjects', {
        name: newSubjectName.trim(),
      })
      if (res.data.data) {
        const created = res.data.data
        setSubjects((prev) => [...prev, created])
        setSelectedId(created.id)
        setNewSubjectName('')
        setIsCreatingNew(false)
      }
    } catch (err) {
      console.error('Failed to create subject:', err)
    } finally {
      setCreatingSubject(false)
    }
  }

  const handleConfirm = async () => {
    if (!selectedId) {
      setError('Please select a subject to append your note to')
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      await onSelectSubject(selectedId)
      onClose()
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } }; message?: string })
          ?.response?.data?.error?.message ||
        (err as Error)?.message ||
        'Failed to append note'
      setError(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-2 text-stone-800">
            <Folder className="w-5 h-5 text-stone-700" />
            <h3 className="font-semibold text-base">Select Target Subject</h3>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            type="button"
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-stone-500 mb-4">
          Choose which subject tab notebook to append this note card to:
        </p>

        {loading ? (
          <div className="flex items-center justify-center py-8 text-stone-400 text-xs gap-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Loading subject tabs...</span>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Subject options list */}
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {subjects.map((sub) => {
                const isSelected = sub.id === selectedId
                return (
                  <div
                    key={sub.id}
                    onClick={() => setSelectedId(sub.id)}
                    className={`flex items-center justify-between p-3 rounded-xl border text-xs font-medium cursor-pointer transition-all ${
                      isSelected
                        ? 'border-stone-900 bg-stone-900 text-stone-50 shadow-xs'
                        : 'border-stone-200/80 bg-stone-50/50 hover:bg-stone-100 text-stone-800'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Folder className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-stone-300' : 'text-stone-500'}`} />
                      <span className="truncate">{sub.name}</span>
                    </div>
                    {isSelected && <Check className="w-4 h-4 text-stone-50 shrink-0" />}
                  </div>
                )
              })}

              {subjects.length === 0 && !isCreatingNew && (
                <div className="text-center py-6 text-xs text-stone-400">
                  No subjects found. Create your first subject below.
                </div>
              )}
            </div>

            {/* Quick create inline form */}
            {isCreatingNew ? (
              <form onSubmit={handleCreateSubject} className="pt-2 border-t border-stone-100 flex items-center gap-2">
                <input
                  type="text"
                  autoFocus
                  placeholder="New Subject Name..."
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-stone-400 focus:bg-white text-stone-900"
                />
                <button
                  type="submit"
                  disabled={creatingSubject || !newSubjectName.trim()}
                  className="px-3 py-1.5 text-xs font-medium bg-stone-900 text-stone-50 hover:bg-stone-800 disabled:opacity-50 rounded-lg transition-colors shadow-xs"
                >
                  {creatingSubject ? 'Adding...' : 'Add'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsCreatingNew(false)}
                  className="px-2 py-1.5 text-xs text-stone-400 hover:text-stone-700"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={() => setIsCreatingNew(true)}
                className="w-full py-2 border border-dashed border-stone-300 hover:border-stone-400 text-stone-600 hover:text-stone-900 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Create New Subject</span>
              </button>
            )}

            {error && <p className="text-xs text-red-600 pt-1">{error}</p>}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center justify-end gap-2 pt-5 border-t border-stone-100 mt-4">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={submitting || !selectedId}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs"
          >
            {submitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Appending Note...</span>
              </>
            ) : (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Append to Subject</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

export default SubjectSelectDialog
