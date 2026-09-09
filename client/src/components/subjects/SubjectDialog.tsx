import React, { useState, useEffect } from 'react'
import { X, FolderPlus, Edit3 } from 'lucide-react'

interface SubjectDialogProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (name: string) => Promise<void>
  initialName?: string
  mode: 'create' | 'rename'
}

export function SubjectDialog({
  isOpen,
  onClose,
  onSubmit,
  initialName = '',
  mode,
}: SubjectDialogProps) {
  const [name, setName] = useState(initialName)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      setName(initialName)
      setError(null)
    }
  }, [isOpen, initialName])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Please enter a subject name')
      return
    }

    setLoading(true)
    setError(null)
    try {
      await onSubmit(name.trim())
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: { message?: string } } }; message?: string })?.response?.data?.error?.message || (err as Error)?.message || 'Failed to save subject'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-2 text-stone-800">
            {mode === 'create' ? (
              <FolderPlus className="w-5 h-5 text-stone-700" />
            ) : (
              <Edit3 className="w-5 h-5 text-stone-700" />
            )}
            <h3 className="font-semibold text-base">
              {mode === 'create' ? 'New Subject Tab' : 'Rename Subject Tab'}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="subject-name" className="block text-xs font-medium text-stone-600 mb-1">
              Subject Name
            </label>
            <input
              id="subject-name"
              type="text"
              autoFocus
              placeholder="e.g. Distributed Systems, Calculus II, Organic Chemistry"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all text-stone-900"
            />
            {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="px-4 py-2 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs"
            >
              {loading ? 'Saving...' : mode === 'create' ? 'Create Tab' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubjectDialog
