import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, FileText, CheckCircle2, AlertCircle } from 'lucide-react'
import { api } from '../lib/api'
import { useDraftNote } from '../features/notes/useDraftNote'
import { RichTextEditor } from '../components/editor/RichTextEditor'
import { SubjectSelectDialog } from '../components/notes/SubjectSelectDialog'
import type { UploadResult } from '../components/editor/ImageUploadDialog'
import type { Note, ApiResponse } from '../types'

export function NewNotePage() {
  const {
    title,
    content,
    draftArtifacts,
    setTitle,
    setContent,
    addDraftArtifact,
    clearDraft,
  } = useDraftNote()

  const [isSelectSubjectOpen, setIsSelectSubjectOpen] = useState(false)
  const [validationError, setValidationError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleFinishClick = () => {
    if (!title.trim() && (!content || !content.content || (content.content as unknown[]).length === 0)) {
      setValidationError('Please write a title or note content before finishing.')
      return
    }
    setValidationError(null)
    setIsSelectSubjectOpen(true)
  }

  const handleImageUpload = async (result: UploadResult) => {
    addDraftArtifact(result)
  }

  const handleSubjectSelected = async (subjectId: string) => {
    setSaving(true)
    setSaveError(null)
    try {
      // 1. Create the note under the selected subject
      const noteRes = await api.post<ApiResponse<Note>>(`/subjects/${subjectId}/notes`, {
        title: title.trim() || 'Untitled Note',
        content: content || { type: 'doc', content: [{ type: 'paragraph' }] },
      })

      if (!noteRes.data.data) {
        throw new Error('Failed to create note record')
      }

      const createdNote = noteRes.data.data

      // 2. Associate any uploaded image artifacts with the created note
      if (draftArtifacts.length > 0) {
        await Promise.all(
          draftArtifacts.map((artifact) =>
            api.post(`/notes/${createdNote.id}/artifacts`, {
              title: artifact.title,
              fileKey: artifact.fileKey,
              fileUrl: artifact.fileUrl,
              mimeType: artifact.mimeType,
            }).catch((err) => {
              console.error('Failed to attach artifact:', err)
            })
          )
        )
      }

      // 3. Clear draft from localStorage on success
      clearDraft()

      // 4. Navigate to selected subject workspace
      navigate(`/?subject=${subjectId}`)
    } catch (err: unknown) {
      console.error('Error persisting note:', err)
      const msg =
        (err as { response?: { data?: { error?: { message?: string } } }; message?: string })
          ?.response?.data?.error?.message ||
        (err as Error)?.message ||
        'Failed to save note to the selected subject. Your draft has been preserved.'
      setSaveError(msg)
      throw err
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-4">
      {/* Top action bar */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-stone-200">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 hover:text-stone-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Workspace</span>
        </Link>

        <div className="flex items-center gap-3">
          {/* Draft status indicator */}
          <div className="hidden sm:flex items-center gap-1 text-[11px] text-stone-400 font-mono">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Draft saved locally</span>
          </div>

          <button
            type="button"
            onClick={handleFinishClick}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving Note...' : 'Finish & Append to Subject'}</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
          {validationError}
        </div>
      )}

      {saveError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Clean Writing Paper Surface */}
      <div className="bg-white border border-stone-200/90 rounded-2xl p-8 shadow-xs space-y-6 min-h-[580px]">
        {/* Title Input */}
        <div>
          <input
            type="text"
            placeholder="Note Title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            className="w-full text-2xl sm:text-3xl font-serif font-bold text-stone-900 placeholder:text-stone-300 focus:outline-none border-b border-stone-100 focus:border-stone-300 pb-3 transition-colors"
          />
        </div>

        {/* Tiptap Rich-Text Editor */}
        <div>
          <RichTextEditor
            content={content}
            onChange={(json) => setContent(json)}
            onImageUpload={handleImageUpload}
            autoFocus={true}
            className="min-h-[360px]"
          />
        </div>

        {/* Draft artifacts indicator */}
        {draftArtifacts.length > 0 && (
          <div className="pt-3 border-t border-stone-100 flex items-center gap-2 text-xs text-stone-400">
            <FileText className="w-3.5 h-3.5" />
            <span>
              {draftArtifacts.length} image artifact{draftArtifacts.length === 1 ? '' : 's'} attached to this draft.
            </span>
          </div>
        )}
      </div>

      {/* Subject Selection Dialog */}
      <SubjectSelectDialog
        isOpen={isSelectSubjectOpen}
        onClose={() => setIsSelectSubjectOpen(false)}
        onSelectSubject={handleSubjectSelected}
      />
    </div>
  )
}

export default NewNotePage
