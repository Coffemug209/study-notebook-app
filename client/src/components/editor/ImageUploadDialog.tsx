import React, { useState, useRef } from 'react'
import { X, Image as ImageIcon, Upload, Loader2, AlertCircle } from 'lucide-react'
import { uploadFiles } from '../../lib/uploadthing'

export interface UploadResult {
  fileUrl: string
  fileKey: string
  title: string
  mimeType: string
}

interface ImageUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (result: UploadResult) => Promise<void>
}

export function ImageUploadDialog({
  isOpen,
  onClose,
  onSuccess,
}: ImageUploadDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      setError('Only image files (PNG, JPEG, WebP, GIF) are allowed')
      return
    }

    if (file.size > 4 * 1024 * 1024) {
      setError('Image size exceeds the 4MB limit')
      return
    }

    setError(null)
    setSelectedFile(file)
    // Clean default title from file name
    const defaultTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ')
    setTitle(defaultTitle)

    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedFile) {
      setError('Please select an image file')
      return
    }

    setUploading(true)
    setError(null)
    try {
      const res = await uploadFiles('imageUploader', {
        files: [selectedFile],
      })

      if (!res || res.length === 0) {
        throw new Error('No upload response received')
      }

      const uploaded = res[0]
      const fileUrl = uploaded.ufsUrl || uploaded.url
      const fileKey = uploaded.key
      const mimeType = selectedFile.type || 'image/png'
      const finalTitle = title.trim() || selectedFile.name

      await onSuccess({
        fileUrl,
        fileKey,
        title: finalTitle,
        mimeType,
      })

      handleClose()
    } catch (err: unknown) {
      console.error('Upload error:', err)
      const message =
        (err as { message?: string })?.message ||
        'Upload failed. Please verify network connection or UploadThing token.'
      setError(message)
    } finally {
      setUploading(false)
    }
  }

  const handleClose = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }
    setSelectedFile(null)
    setTitle('')
    setPreviewUrl(null)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/40 backdrop-blur-xs p-4">
      <div className="bg-white border border-stone-200 rounded-2xl p-6 w-full max-w-md shadow-xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
          <div className="flex items-center gap-2 text-stone-800">
            <ImageIcon className="w-5 h-5 text-stone-700" />
            <h3 className="font-semibold text-base">Upload Image Artifact</h3>
          </div>
          <button
            onClick={handleClose}
            disabled={uploading}
            type="button"
            className="text-stone-400 hover:text-stone-700 p-1 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleUpload} className="space-y-4">
          {/* File Selector */}
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />

            {!previewUrl ? (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-stone-200 hover:border-stone-400 bg-stone-50/60 hover:bg-stone-50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-500">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs text-stone-700 font-medium">
                  Click to select an image from your computer
                </div>
                <div className="text-[11px] text-stone-400">PNG, JPEG, WebP, GIF up to 4MB</div>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-stone-200 bg-stone-100 max-h-48 flex items-center justify-center">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="object-contain max-h-44 w-full"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="absolute bottom-2 right-2 px-2.5 py-1 bg-stone-900/80 hover:bg-stone-900 text-stone-50 text-[11px] rounded-lg shadow-xs transition-colors backdrop-blur-xs"
                >
                  Change Image
                </button>
              </div>
            )}
          </div>

          {/* Image Title */}
          {selectedFile && (
            <div>
              <label htmlFor="artifact-title" className="block text-xs font-medium text-stone-600 mb-1">
                Image / Artifact Title
              </label>
              <input
                id="artifact-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Memory Architecture Diagram"
                disabled={uploading}
                className="w-full px-3.5 py-2 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400 focus:bg-white transition-all text-stone-900"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                This title identifies the image in the subject's Artifacts panel.
              </p>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={uploading}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-stone-50 bg-stone-900 hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors shadow-xs"
            >
              {uploading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Insert into Note</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ImageUploadDialog
