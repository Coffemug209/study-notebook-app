import { useState } from 'react'
import { Trash2, Eye, FileText } from 'lucide-react'
import type { Artifact } from '../../types'
import { ArtifactPreviewDialog } from './ArtifactPreviewDialog'
import { DeleteArtifactDialog } from './DeleteArtifactDialog'

interface ArtifactCardProps {
  artifact: Artifact
  onDelete: (artifactId: string) => Promise<void>
}

export function ArtifactCard({ artifact, onDelete }: ArtifactCardProps) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  return (
    <>
      <div className="group relative bg-white border border-stone-200/90 hover:border-stone-300 rounded-xl overflow-hidden shadow-2xs hover:shadow-xs transition-all flex flex-col">
        {/* Image Thumbnail Container */}
        <div
          onClick={() => setIsPreviewOpen(true)}
          className="relative aspect-video bg-stone-100 overflow-hidden cursor-pointer flex items-center justify-center"
        >
          <img
            src={artifact.fileUrl}
            alt={artifact.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            loading="lazy"
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-stone-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <span className="p-1.5 bg-white/90 text-stone-800 rounded-lg shadow-xs hover:bg-white transition-colors">
              <Eye className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        {/* Card Info */}
        <div className="p-3 flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h4
              onClick={() => setIsPreviewOpen(true)}
              className="text-xs font-semibold text-stone-800 hover:text-stone-950 truncate cursor-pointer transition-colors"
              title={artifact.title}
            >
              {artifact.title || 'Untitled Image'}
            </h4>
            {artifact.note && (
              <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-0.5 truncate">
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate">{artifact.note.title || 'Note'}</span>
              </div>
            )}
          </div>

          {/* Delete Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setIsDeleteOpen(true)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all shrink-0"
            title="Delete Artifact"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Lightbox Preview */}
      <ArtifactPreviewDialog
        artifact={isPreviewOpen ? artifact : null}
        onClose={() => setIsPreviewOpen(false)}
      />

      {/* Delete Confirmation */}
      <DeleteArtifactDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={async () => {
          await onDelete(artifact.id)
        }}
        artifactTitle={artifact.title}
      />
    </>
  )
}

export default ArtifactCard
