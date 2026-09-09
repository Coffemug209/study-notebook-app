import { AppError } from './errorHandler.js'

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function isValidUUID(id: unknown): id is string {
  return typeof id === 'string' && UUID_REGEX.test(id.trim())
}

export function assertValidUUID(id: unknown, fieldName = 'ID'): string {
  if (!isValidUUID(id)) {
    throw new AppError(`Invalid ${fieldName} format: must be a valid UUID`, 400)
  }
  return (id as string).trim()
}

export function validateSubjectName(name: unknown): string {
  if (typeof name !== 'string' || !name.trim()) {
    throw new AppError('Subject name is required and cannot be empty', 400)
  }
  const trimmed = name.trim()
  if (trimmed.length > 100) {
    throw new AppError('Subject name cannot exceed 100 characters', 400)
  }
  return trimmed
}

export function validateNoteTitle(title: unknown): string {
  if (title === undefined || title === null) {
    return 'Untitled Note'
  }
  if (typeof title !== 'string') {
    throw new AppError('Note title must be a string', 400)
  }
  const trimmed = title.trim()
  if (trimmed.length > 255) {
    throw new AppError('Note title cannot exceed 255 characters', 400)
  }
  return trimmed || 'Untitled Note'
}

export function validateTiptapContent(content: unknown): Record<string, unknown> {
  if (content === undefined || content === null) {
    return { type: 'doc', content: [] }
  }

  if (typeof content !== 'object' || Array.isArray(content)) {
    throw new AppError('Note content must be a valid Tiptap JSON document object', 400)
  }

  const doc = content as Record<string, unknown>
  if (doc.type !== 'doc') {
    throw new AppError('Note content root type must be "doc"', 400)
  }

  if (doc.content !== undefined && !Array.isArray(doc.content)) {
    throw new AppError('Note content.content property must be an array of nodes', 400)
  }

  return doc
}

const ALLOWED_IMAGE_MIMES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
])

export function validateArtifactPayload(payload: {
  title?: unknown
  fileKey?: unknown
  fileUrl?: unknown
  mimeType?: unknown
}): {
  title: string
  fileKey: string
  fileUrl: string
  mimeType: string
} {
  const { title, fileKey, fileUrl, mimeType } = payload

  if (typeof fileKey !== 'string' || !fileKey.trim()) {
    throw new AppError('Artifact fileKey is required', 400)
  }

  if (typeof fileUrl !== 'string' || !fileUrl.trim()) {
    throw new AppError('Artifact fileUrl is required', 400)
  }

  // Basic URL sanity check
  try {
    const parsed = new URL(fileUrl.trim())
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error()
    }
  } catch {
    throw new AppError('Artifact fileUrl must be a valid http/https URL', 400)
  }

  if (typeof mimeType !== 'string' || !ALLOWED_IMAGE_MIMES.has(mimeType.toLowerCase().trim())) {
    throw new AppError(
      `Invalid artifact mimeType. Allowed types: ${Array.from(ALLOWED_IMAGE_MIMES).join(', ')}`,
      400
    )
  }

  const validTitle = typeof title === 'string' && title.trim() ? title.trim() : 'Untitled Image'
  if (validTitle.length > 255) {
    throw new AppError('Artifact title cannot exceed 255 characters', 400)
  }

  return {
    title: validTitle,
    fileKey: fileKey.trim(),
    fileUrl: fileUrl.trim(),
    mimeType: mimeType.toLowerCase().trim(),
  }
}

export function validateOrderedIds(orderedIds: unknown): string[] {
  if (!Array.isArray(orderedIds)) {
    throw new AppError('orderedIds must be an array of subject IDs', 400)
  }
  if (orderedIds.length === 0) {
    throw new AppError('orderedIds array cannot be empty', 400)
  }

  const validated: string[] = []
  const seen = new Set<string>()

  for (const id of orderedIds) {
    if (!isValidUUID(id)) {
      throw new AppError(`Invalid UUID found in orderedIds: '${id}'`, 400)
    }
    const cleanId = id.trim()
    if (seen.has(cleanId)) {
      throw new AppError(`Duplicate subject ID found in orderedIds: '${cleanId}'`, 400)
    }
    seen.add(cleanId)
    validated.push(cleanId)
  }

  return validated
}
