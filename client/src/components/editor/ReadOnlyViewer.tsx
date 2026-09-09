import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'

interface ReadOnlyViewerProps {
  content: Record<string, unknown> | null
  className?: string
}

export function ReadOnlyViewer({ content, className = '' }: ReadOnlyViewerProps) {
  const editor = useEditor({
    editable: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: true,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Image.configure({
        inline: true,
      }),
    ],
    content: content || {
      type: 'doc',
      content: [],
    },
    editorProps: {
      attributes: {
        class: 'text-stone-700 text-sm font-sans leading-relaxed pointer-events-auto',
      },
    },
  })

  if (!content) {
    return <span className="text-stone-300 italic text-xs">No notes written yet. Click to write...</span>
  }

  return (
    <div className={`prose-sm max-w-none ${className}`}>
      <EditorContent editor={editor} />
    </div>
  )
}

export default ReadOnlyViewer
