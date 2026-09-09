import { Link } from 'react-router-dom'
import { BookX, ArrowLeft } from 'lucide-react'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
      <div className="w-12 h-12 rounded-2xl bg-stone-100 flex items-center justify-center text-stone-400 mb-4 border border-stone-200">
        <BookX className="w-6 h-6 text-stone-500" />
      </div>
      <h1 className="text-xl font-serif font-semibold text-stone-900 mb-1">Page Not Found</h1>
      <p className="text-xs text-stone-500 max-w-sm mb-6">
        The page or notebook note you are looking for does not exist or has moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-stone-50 bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors shadow-xs"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Return to Workspace
      </Link>
    </div>
  )
}

export default NotFoundPage
