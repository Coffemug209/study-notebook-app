import { AlertCircle, RefreshCw } from 'lucide-react'

interface ErrorStateProps {
  title?: string
  message: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Something went wrong',
  message,
  onRetry,
  className = 'py-8',
}: ErrorStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center p-6 bg-red-50/60 border border-red-200/80 rounded-xl text-red-800 ${className}`}
    >
      <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
      <h3 className="text-sm font-semibold text-red-900 mb-1">{title}</h3>
      <p className="text-xs text-red-700 max-w-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          type="button"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-800 bg-white border border-red-300 rounded-lg hover:bg-red-50 transition-colors shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Try Again
        </button>
      )}
    </div>
  )
}

export default ErrorState
