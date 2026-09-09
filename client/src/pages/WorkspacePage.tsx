import { useState } from 'react'
import { BookOpen, Plus } from 'lucide-react'
import { useSubjects } from '../features/subjects/useSubjects'
import { useNotes } from '../features/notes/useNotes'
import { useArtifacts } from '../features/artifacts/useArtifacts'
import { SubjectTabs } from '../components/subjects/SubjectTabs'
import { SubjectDialog } from '../components/subjects/SubjectDialog'
import { NoteCard } from '../components/notes/NoteCard'
import { ArtifactsPanel } from '../components/artifacts/ArtifactsPanel'
import { LoadingState } from '../components/common/LoadingState'
import { ErrorState } from '../components/common/ErrorState'
import { EmptyState } from '../components/common/EmptyState'

export function WorkspacePage() {
  const {
    subjects,
    activeSubject,
    activeSubjectId,
    loading: subjectsLoading,
    error: subjectsError,
    selectSubject,
    createSubject,
    renameSubject,
    deleteSubject,
    moveSubject,
    refetch: refetchSubjects,
  } = useSubjects()

  const {
    notes,
    loading: notesLoading,
    error: notesError,
    createNote,
    updateNote,
    deleteNote,
    refetch: refetchNotes,
  } = useNotes(activeSubjectId)

  const {
    artifacts,
    loading: artifactsLoading,
    error: artifactsError,
    deleteArtifact,
    refetch: refetchArtifacts,
  } = useArtifacts(activeSubjectId)

  const [isFirstSubjectDialogOpen, setIsFirstSubjectDialogOpen] = useState(false)
  const [creatingNote, setCreatingNote] = useState(false)

  const handleAddNote = async () => {
    if (!activeSubjectId) return
    setCreatingNote(true)
    try {
      await createNote('New Note')
    } catch (err) {
      console.error('Failed to create note:', err)
    } finally {
      setCreatingNote(false)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    await deleteNote(noteId)
    // Deleting a note cascade deletes its artifacts, so refresh artifacts panel
    refetchArtifacts()
  }

  const handleUpdateNote = async (
    noteId: string,
    data: { title?: string; content?: Record<string, unknown> }
  ) => {
    const updated = await updateNote(noteId, data)
    // Refresh artifacts in case an image was uploaded
    refetchArtifacts()
    return updated
  }

  return (
    <div className="space-y-6">
      {/* Subject Tabs Navigation (PART 05) */}
      <SubjectTabs
        subjects={subjects}
        activeSubjectId={activeSubjectId}
        onSelect={selectSubject}
        onCreate={createSubject}
        onRename={renameSubject}
        onDelete={deleteSubject}
        onMove={moveSubject}
        loading={subjectsLoading}
      />

      {/* Main Workspace Grid (Notebook Canvas & Artifacts Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center: Notebook Canvas (Cols 1-8) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white border border-stone-200/90 rounded-2xl p-6 min-h-[480px] shadow-xs flex flex-col">
            {/* Subject Header */}
            <div className="border-b border-stone-100 pb-4 mb-6 flex items-center justify-between gap-4">
              <div>
                <h1 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
                  {activeSubject ? activeSubject.name : 'Study Notebook'}
                </h1>
                <p className="text-xs text-stone-500 mt-0.5">
                  {activeSubject
                    ? `${notes.length} note${notes.length === 1 ? '' : 's'} in this subject`
                    : 'Personal Study Workspace'}
                </p>
              </div>

              {activeSubject && (
                <button
                  type="button"
                  onClick={handleAddNote}
                  disabled={creatingNote}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{creatingNote ? 'Adding...' : 'Add Note'}</span>
                </button>
              )}
            </div>

            {/* Notebook Content / Note Cards List */}
            <div className="flex-1 flex flex-col">
              {subjectsLoading ? (
                <LoadingState message="Loading subject workspace..." />
              ) : subjectsError ? (
                <ErrorState message={subjectsError} onRetry={refetchSubjects} />
              ) : subjects.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="w-6 h-6 text-stone-400" />}
                  title="No subject tabs yet"
                  description="Add your first study subject tab above to organize note cards, rich text summaries, and visual artifacts."
                  actionLabel="Create First Subject"
                  onAction={() => setIsFirstSubjectDialogOpen(true)}
                />
              ) : notesLoading ? (
                <LoadingState message="Loading notes..." />
              ) : notesError ? (
                <ErrorState message={notesError} onRetry={refetchNotes} />
              ) : notes.length === 0 ? (
                <EmptyState
                  icon={<BookOpen className="w-6 h-6 text-stone-400" />}
                  title="No notes in this subject"
                  description="Create a note card to jot down definitions, summaries, theorems, or formulas."
                  actionLabel="Add Your First Note"
                  onAction={handleAddNote}
                />
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onUpdate={handleUpdateNote}
                      onDelete={handleDeleteNote}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: In-Tab Artifacts Panel (Cols 9-12) */}
        <div className="lg:col-span-4">
          <ArtifactsPanel
            artifacts={artifacts}
            loading={artifactsLoading}
            error={artifactsError}
            onDelete={deleteArtifact}
            onRetry={refetchArtifacts}
            subjectName={activeSubject?.name}
          />
        </div>
      </div>

      {/* Dialog for empty state create subject action */}
      <SubjectDialog
        isOpen={isFirstSubjectDialogOpen}
        onClose={() => setIsFirstSubjectDialogOpen(false)}
        onSubmit={async (name) => {
          await createSubject(name)
        }}
        mode="create"
      />
    </div>
  )
}

export default WorkspacePage
