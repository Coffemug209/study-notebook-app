import { X, ExternalLink, FileText, Calendar } from 'lucide-react'
import type { Artifact } from '../../types'

interface ArtifactPreviewDialogProps {
  artifact: Artifact | null
  onClose: () => void
}

export function ArtifactPreviewDialog({
  artifact,
  onClose,
}: ArtifactPreviewDialogProps) {
  if (!artifact) return null

  const formattedDate = new Date(artifact.updatedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/60 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white border border-stone-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-stone-100 bg-stone-50/60">
          <div className="min-w-0 pr-2">
            <h3 className="font-semibold text-stone-900 text-sm truncate">
              {artifact.title || 'Untitled Image Artifact'}
            </h3>
            {artifact.note && (
              <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5 truncate">
                <FileText className="w-3 h-3 text-stone-400 shrink-0" />
                <span>In Note: {artifact.note.title || 'Untitled Note'}</span>
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <a
              href={artifact.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
              title="Open full size in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
            <button
              onClick={onClose}
              type="button"
              className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Image Display Area */}
        <div className="flex-1 bg-stone-950 flex items-center justify-center p-4 overflow-hidden min-h-[300px]">
          <img
            src={artifact.fileUrl}
            alt={artifact.title || 'Artifact preview'}
            className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
          />
        </div>

        {/* Footer info */}
        <div className="px-5 py-3 border-t border-stone-100 bg-white flex items-center justify-between text-xs text-stone-400 font-sans">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>Uploaded {formattedDate}</span>
          </div>
          <span className="font-mono text-[11px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded">
            {artifact.mimeType}
          </span>
        </div>
      </div>
    </div>
  )
}

export default ArtifactPreviewDialog
