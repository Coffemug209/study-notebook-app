import { Image as ImageIcon } from 'lucide-react'
import type { Artifact } from '../../types'
import { ArtifactCard } from './ArtifactCard'
import { LoadingState } from '../common/LoadingState'
import { ErrorState } from '../common/ErrorState'

interface ArtifactsPanelProps {
  artifacts: Artifact[]
  loading?: boolean
  error?: string | null
  onDelete: (artifactId: string) => Promise<void>
  onRetry?: () => void
  subjectName?: string
}

export function ArtifactsPanel({
  artifacts,
  loading = false,
  error = null,
  onDelete,
  onRetry,
  subjectName,
}: ArtifactsPanelProps) {
  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-5 shadow-xs flex flex-col min-h-[480px]">
      {/* Panel Header */}
      <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-stone-100 flex items-center justify-center text-stone-700">
            <ImageIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h2 className="text-xs font-semibold text-stone-900 uppercase tracking-wider">
              Artifacts
            </h2>
          </div>
        </div>

        {/* Count badge */}
        <span className="text-[11px] font-mono font-medium bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md">
          {artifacts.length}
        </span>
      </div>

      {/* Body content */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <LoadingState message="Loading artifacts..." className="py-12" />
        ) : error ? (
          <ErrorState message={error} onRetry={onRetry} className="py-6" />
        ) : artifacts.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-stone-400">
            <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-center text-stone-400 mb-3">
              <ImageIcon className="w-5 h-5" />
            </div>
            <p className="text-xs font-medium text-stone-700">No artifacts yet</p>
            <p className="text-[11px] text-stone-400 mt-1 max-w-xs leading-relaxed">
              {subjectName
                ? `Images uploaded in "${subjectName}" notes will appear in this panel.`
                : 'Upload images inside note cards to browse visual diagrams and charts here.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3 overflow-y-auto max-h-[600px] pr-1 scrollbar-thin">
            {artifacts.map((artifact) => (
              <ArtifactCard
                key={artifact.id}
                artifact={artifact}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ArtifactsPanel
