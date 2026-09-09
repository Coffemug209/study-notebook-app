import React from 'react'
import { BookOpen } from 'lucide-react'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
  className = 'py-16',
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center p-8 text-stone-500 ${className}`}>
      <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-3 border border-stone-200/60">
        {icon || <BookOpen className="w-6 h-6" />}
      </div>
      <h3 className="text-base font-medium text-stone-800 mb-1">{title}</h3>
      {description && <p className="text-xs text-stone-500 max-w-sm mb-4 leading-relaxed">{description}</p>}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          type="button"
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-xs hover:border-stone-400"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
