import { useState } from 'react'
import { Plus, MoreVertical, Edit3, Trash2, ChevronLeft, ChevronRight, BookOpen } from 'lucide-react'
import type { Subject } from '../../types'
import { SubjectDialog } from './SubjectDialog'
import { DeleteSubjectDialog } from './DeleteSubjectDialog'

interface SubjectTabsProps {
  subjects: Subject[]
  activeSubjectId: string | null
  onSelect: (id: string) => void
  onCreate: (name: string) => Promise<Subject>
  onRename: (id: string, name: string) => Promise<Subject>
  onDelete: (id: string) => Promise<void>
  onMove: (index: number, direction: 'left' | 'right') => Promise<void>
  loading?: boolean
}

export function SubjectTabs({
  subjects,
  activeSubjectId,
  onSelect,
  onCreate,
  onRename,
  onDelete,
  onMove,
  loading = false,
}: SubjectTabsProps) {
  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [deletingSubject, setDeletingSubject] = useState<Subject | null>(null)
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)

  return (
    <div className="relative">
      <div className="bg-white border border-stone-200/90 rounded-2xl p-2 shadow-xs flex items-center justify-between gap-3">
        {/* Tabs Container */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1 px-1 flex-1">
          <div className="flex items-center gap-1 px-2 text-stone-400 font-mono text-[11px] uppercase tracking-wider select-none shrink-0">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Tabs</span>
          </div>

          {loading ? (
            <div className="flex items-center gap-2 px-3 py-1 text-xs text-stone-400 animate-pulse">
              Loading tabs...
            </div>
          ) : subjects.length === 0 ? (
            <div className="text-xs text-stone-400 italic px-2">
              No subjects yet. Click "+ Add Subject" to get started.
            </div>
          ) : (
            subjects.map((sub, index) => {
              const isActive = sub.id === activeSubjectId
              const isMenuOpen = menuOpenId === sub.id

              return (
                <div
                  key={sub.id}
                  className={`group relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-stone-900 text-stone-50 shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/80 bg-stone-50/70 border border-stone-200/50'
                  }`}
                  onClick={() => onSelect(sub.id)}
                >
                  <span className="truncate max-w-[140px] sm:max-w-[180px] select-none">
                    {sub.name}
                  </span>

                  {/* Context menu trigger */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setMenuOpenId(isMenuOpen ? null : sub.id)
                      }}
                      className={`p-0.5 rounded-md transition-opacity ${
                        isActive
                          ? 'text-stone-300 hover:text-stone-50 hover:bg-stone-800'
                          : 'text-stone-400 hover:text-stone-700 hover:bg-stone-200/80'
                      }`}
                      title="Subject Options"
                    >
                      <MoreVertical className="w-3.5 h-3.5" />
                    </button>

                    {/* Dropdown Menu */}
                    {isMenuOpen && (
                      <>
                        <div
                          className="fixed inset-0 z-20"
                          onClick={(e) => {
                            e.stopPropagation()
                            setMenuOpenId(null)
                          }}
                        />
                        <div
                          className="absolute right-0 top-full mt-1.5 z-30 w-36 bg-white border border-stone-200 rounded-xl shadow-lg py-1 text-stone-700 animate-in fade-in zoom-in-95 duration-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpenId(null)
                              setEditingSubject(sub)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 transition-colors text-left"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-stone-500" />
                            <span>Rename</span>
                          </button>

                          {/* Reorder Left */}
                          {index > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null)
                                onMove(index, 'left')
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 transition-colors text-left"
                            >
                              <ChevronLeft className="w-3.5 h-3.5 text-stone-500" />
                              <span>Move Left</span>
                            </button>
                          )}

                          {/* Reorder Right */}
                          {index < subjects.length - 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setMenuOpenId(null)
                                onMove(index, 'right')
                              }}
                              className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-stone-700 hover:bg-stone-100 transition-colors text-left"
                            >
                              <ChevronRight className="w-3.5 h-3.5 text-stone-500" />
                              <span>Move Right</span>
                            </button>
                          )}

                          <div className="my-1 border-t border-stone-100" />

                          <button
                            type="button"
                            onClick={() => {
                              setMenuOpenId(null)
                              setDeletingSubject(sub)
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* Add Tab Action */}
        <button
          type="button"
          onClick={() => setIsCreateOpen(true)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 bg-stone-100/90 hover:bg-stone-200/90 rounded-xl transition-colors shrink-0 shadow-2xs cursor-pointer"
          title="Add New Subject Tab"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Add Subject</span>
        </button>
      </div>

      {/* Create Subject Modal */}
      <SubjectDialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={async (name) => {
          await onCreate(name)
        }}
        mode="create"
      />

      {/* Rename Subject Modal */}
      {editingSubject && (
        <SubjectDialog
          isOpen={!!editingSubject}
          onClose={() => setEditingSubject(null)}
          onSubmit={async (name) => {
            await onRename(editingSubject.id, name)
          }}
          initialName={editingSubject.name}
          mode="rename"
        />
      )}

      {/* Delete Subject Confirmation Modal */}
      {deletingSubject && (
        <DeleteSubjectDialog
          isOpen={!!deletingSubject}
          onClose={() => setDeletingSubject(null)}
          onConfirm={async () => {
            await onDelete(deletingSubject.id)
          }}
          subjectName={deletingSubject.name}
        />
      )}
    </div>
  )
}

export default SubjectTabs
