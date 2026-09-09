import { Link, useLocation } from 'react-router-dom'
import { BookMarked, PenLine } from 'lucide-react'

export function Navbar() {
  const location = useLocation()
  const isNewNote = location.pathname === '/new-note'

  return (
    <header className="sticky top-0 z-30 bg-stone-50/90 backdrop-blur-md border-b border-stone-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-15 flex items-center justify-between">
        {/* Branding */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group text-stone-900 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-stone-100 flex items-center justify-center shadow-xs group-hover:bg-stone-800 transition-colors">
            <BookMarked className="w-4 h-4" />
          </div>
          <div>
            <span className="font-serif font-semibold text-base tracking-tight text-stone-900 flex items-center gap-1.5">
              Study Organizer
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500" title="Online" />
            </span>
          </div>
        </Link>

        {/* Top Actions */}
        <div className="flex items-center gap-3">
          {!isNewNote ? (
            <Link
              to="/new-note"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-medium text-stone-50 bg-stone-900 rounded-lg hover:bg-stone-800 transition-all shadow-xs hover:shadow"
            >
              <PenLine className="w-3.5 h-3.5" />
              <span>New Note</span>
            </Link>
          ) : (
            <Link
              to="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-stone-700 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors shadow-xs"
            >
              <span>Back to Workspace</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}

export default Navbar
