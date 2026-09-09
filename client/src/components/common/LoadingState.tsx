import { Loader2 } from 'lucide-react'

interface LoadingStateProps {
  message?: string
  className?: string
}

export function LoadingState({
  message = 'Loading...',
  className = 'py-12',
}: LoadingStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-stone-400 gap-3 ${className}`}>
      <Loader2 className="w-6 h-6 animate-spin text-stone-500" />
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

export default LoadingState
