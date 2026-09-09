import React, { useState, useRef, useEffect } from 'react'
import {
  Trash2,
  Clock,
  Edit2,
  Check,
  Loader2,
  AlertCircle,
  RotateCcw,
} from 'lucide-react'
import type { Note } from '../../types'
import { api } from '../../lib/api'
import { useAutosaveNote, type SaveStatus } from '../../features/notes/useAutosaveNote'
import { RichTextEditor } from '../editor/RichTextEditor'
import { ReadOnlyViewer } from '../editor/ReadOnlyViewer'
import type { UploadResult } from '../editor/ImageUploadDialog'
import { DeleteNoteDialog } from './DeleteNoteDialog'

interface NoteCardProps {
  note: Note
  onUpdate: (noteId: string, data: { title?: string; content?: Record<string, unknown> }) => Promise<Note>
  onDelete: (noteId: string) => Promise<void>
}

export function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const titleInputRef = useRef<HTMLInputElement>(null)

  const {
    title,
    content,
    status,
    error: saveError,
    setTitle,
    setContent,
    flushSave,
    retrySave,
  } = useAutosaveNote({
    note,
    onSave: onUpdate,
    debounceMs: 1000,
  })

  // Click-outside listener to automatically flush and exit edit mode
  useEffect(() => {
    if (!isEditing) return

    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      // If clicking inside modals/dialogs, ignore
      const target = e.target as HTMLElement | null
      if (target?.closest('[role="dialog"]') || target?.closest('.modal-portal')) {
        return
      }

      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        flushSave().then(() => {
          setIsEditing(false)
        })
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isEditing, flushSave])

  const handleEnterEdit = (targetField: 'title' | 'content') => {
    setIsEditing(true)
    if (targetField === 'title') {
      setTimeout(() => {
        titleInputRef.current?.focus()
      }, 50)
    }
  }

  const handleDone = async () => {
    await flushSave()
    setIsEditing(false)
  }

  const handleImageUpload = async (result: UploadResult) => {
    try {
      await api.post(`/notes/${note.id}/artifacts`, {
        title: result.title,
        fileKey: result.fileKey,
        fileUrl: result.fileUrl,
        mimeType: result.mimeType,
      })
    } catch (err) {
      console.error('Failed to save artifact record:', err)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleDone()
    }
  }

  const formattedDate = new Date(note.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  const renderStatusBadge = (s: SaveStatus) => {
    switch (s) {
      case 'saving':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-stone-500 font-sans">
            <Loader2 className="w-3 h-3 animate-spin text-stone-600" />
            <span>Saving...</span>
          </span>
        )
      case 'saved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 font-sans">
            <Check className="w-3 h-3 text-emerald-600" />
            <span>Saved</span>
          </span>
        )
      case 'unsaved':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 font-sans">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span>Unsaved</span>
          </span>
        )
      case 'error':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] text-red-600 font-sans">
            <AlertCircle className="w-3 h-3 text-red-500" />
            <span>Error</span>
            <button
              type="button"
              onClick={retrySave}
              className="underline ml-0.5 hover:text-red-800 focus:outline-none"
            >
              Retry
            </button>
          </span>
        )
    }
  }

  return (
    <>
      <div
        ref={cardRef}
        tabIndex={0}
        aria-label={`Note: ${title || 'Untitled Note'}`}
        className={`group bg-white border rounded-2xl transition-all duration-200 shadow-xs hover:shadow-sm ${
          isEditing
            ? 'border-stone-400 ring-2 ring-stone-900/5 shadow-md p-6'
            : 'border-stone-200/90 hover:border-stone-300 p-5 cursor-pointer focus-visible:ring-2 focus-visible:ring-stone-400'
        }`}
        onClick={() => {
          if (!isEditing) handleEnterEdit('content')
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Card Header: Title, Status & Actions */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                ref={titleInputRef}
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Note Title..."
                className="w-full text-base font-serif font-bold text-stone-900 focus:outline-none bg-transparent border-b border-stone-200 focus:border-stone-400 pb-1 transition-colors"
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <h3
                className="text-base font-serif font-bold text-stone-900 tracking-tight group-hover:text-stone-800 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEnterEdit('title')
                }}
              >
                {title || 'Untitled Note'}
              </h3>
            )}

            {/* Timestamps & Autosave Status */}
            <div className="flex items-center gap-3 text-[11px] text-stone-400 mt-1 font-sans flex-wrap">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>Updated {formattedDate}</span>
              </div>
              {isEditing && (
                <div className="flex items-center gap-2">
                  <span className="text-stone-300">•</span>
                  {renderStatusBadge(status)}
                </div>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div
            className="flex items-center gap-1.5 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            {isEditing ? (
              <button
                type="button"
                onClick={handleDone}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 rounded-xl transition-colors shadow-xs"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Done</span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleEnterEdit('content')
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-lg transition-all"
                  title="Edit Note"
                  aria-label="Edit Note"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsDeleteDialogOpen(true)
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Delete Note"
                  aria-label="Delete Note"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Card Body: Tiptap Content area */}
        <div className="pt-1" onClick={(e) => e.stopPropagation()}>
          {isEditing ? (
            <div>
              <RichTextEditor
                content={content}
                onChange={(json) => setContent(json)}
                onImageUpload={handleImageUpload}
                autoFocus={true}
              />
              <div className="flex items-center justify-between text-[11px] text-stone-400 mt-2 px-1">
                <span>Autosaved as you type • Esc or 'Done' to finish</span>
                {status === 'error' && saveError && (
                  <span className="text-red-600 flex items-center gap-1">
                    <RotateCcw className="w-3 h-3" />
                    <span>Failed to autosave</span>
                  </span>
                )}
              </div>
            </div>
          ) : (
            <div
              onClick={() => handleEnterEdit('content')}
              className="min-h-[40px] cursor-text"
            >
              <ReadOnlyViewer content={note.content} />
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation modal */}
      <DeleteNoteDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={async () => {
          await onDelete(note.id)
        }}
        noteTitle={note.title}
      />
    </>
  )
}

export default NoteCard
