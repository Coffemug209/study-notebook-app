import { useState, useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import { EditorToolbar } from './EditorToolbar'
import { ImageUploadDialog, type UploadResult } from './ImageUploadDialog'

interface RichTextEditorProps {
  content: Record<string, unknown> | null
  onChange?: (json: Record<string, unknown>) => void
  onImageUpload?: (result: UploadResult) => Promise<void>
  autoFocus?: boolean
  className?: string
  showToolbar?: boolean
}

export function RichTextEditor({
  content,
  onChange,
  onImageUpload,
  autoFocus = false,
  className = '',
  showToolbar = true,
}: RichTextEditorProps) {
  const isInitialMount = useRef(true)
  const [isImageDialogOpen, setIsImageDialogOpen] = useState(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline cursor-pointer',
        },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
    ],
    content: content || {
      type: 'doc',
      content: [{ type: 'paragraph' }],
    },
    autofocus: autoFocus ? 'end' : false,
    onUpdate: ({ editor: ed }) => {
      if (onChange) {
        onChange(ed.getJSON() as Record<string, unknown>)
      }
    },
    editorProps: {
      attributes: {
        class: 'focus:outline-none p-3.5 min-h-[120px] text-stone-800 text-sm font-sans leading-relaxed',
      },
    },
  })

  // Synchronize editor content if external content changes
  useEffect(() => {
    if (editor && !isInitialMount.current && content) {
      const currentJson = JSON.stringify(editor.getJSON())
      const nextJson = JSON.stringify(content)
      if (currentJson !== nextJson) {
        editor.commands.setContent(content, { emitUpdate: false })
      }
    }
    isInitialMount.current = false
  }, [content, editor])

  const handleImageSuccess = async (result: UploadResult) => {
    if (editor) {
      // Insert image node into Tiptap document
      editor
        .chain()
        .focus()
        .setImage({
          src: result.fileUrl,
          alt: result.title,
          title: result.title,
        })
        .run()

      if (onChange) {
        onChange(editor.getJSON() as Record<string, unknown>)
      }
    }

    if (onImageUpload) {
      await onImageUpload(result)
    }
  }

  return (
    <div className={`border border-stone-200 rounded-xl bg-white focus-within:border-stone-400 transition-all ${className}`}>
      {showToolbar && (
        <EditorToolbar
          editor={editor}
          onOpenImageUpload={() => setIsImageDialogOpen(true)}
        />
      )}
      <EditorContent editor={editor} />

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        isOpen={isImageDialogOpen}
        onClose={() => setIsImageDialogOpen(false)}
        onSuccess={handleImageSuccess}
      />
    </div>
  )
}

export default RichTextEditor
