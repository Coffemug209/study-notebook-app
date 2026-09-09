import { prisma } from '../lib/prisma.js'
import { AppError } from '../middleware/errorHandler.js'
import {
  assertValidUUID,
  validateArtifactPayload,
} from '../middleware/validate.js'

export class ArtifactService {
  static async getArtifactsBySubject(subjectId: string) {
    const validSubjectId = assertValidUUID(subjectId, 'Subject ID')
    const subject = await prisma.subject.findUnique({ where: { id: validSubjectId } })
    if (!subject) {
      throw new AppError(`Subject with ID '${validSubjectId}' not found`, 404)
    }

    return prisma.artifact.findMany({
      where: { subjectId: validSubjectId },
      orderBy: { updatedAt: 'desc' },
      include: {
        note: {
          select: { id: true, title: true },
        },
      },
    })
  }

  static async getArtifactById(artifactId: string) {
    const validArtifactId = assertValidUUID(artifactId, 'Artifact ID')
    const artifact = await prisma.artifact.findUnique({
      where: { id: validArtifactId },
      include: {
        note: true,
        subject: true,
      },
    })
    if (!artifact) {
      throw new AppError(`Artifact with ID '${validArtifactId}' not found`, 404)
    }
    return artifact
  }

  static async createArtifactForNote(
    noteId: string,
    data: {
      title?: unknown
      fileKey?: unknown
      fileUrl?: unknown
      mimeType?: unknown
    }
  ) {
    const validNoteId = assertValidUUID(noteId, 'Note ID')
    const note = await prisma.note.findUnique({ where: { id: validNoteId } })
    if (!note) {
      throw new AppError(`Note with ID '${validNoteId}' not found`, 404)
    }

    const validated = validateArtifactPayload(data)

    // Strict relationship binding: artifact subjectId is strictly locked to note.subjectId
    return prisma.artifact.create({
      data: {
        noteId: validNoteId,
        subjectId: note.subjectId,
        title: validated.title,
        fileKey: validated.fileKey,
        fileUrl: validated.fileUrl,
        mimeType: validated.mimeType,
      },
    })
  }

  static async updateArtifact(artifactId: string, data: { title?: unknown }) {
    const validArtifactId = assertValidUUID(artifactId, 'Artifact ID')
    await this.getArtifactById(validArtifactId)

    const updateData: { title?: string } = {}

    if (data.title !== undefined) {
      if (typeof data.title !== 'string') {
        throw new AppError('Artifact title must be a string', 400)
      }
      const trimmed = data.title.trim()
      if (trimmed.length > 255) {
        throw new AppError('Artifact title cannot exceed 255 characters', 400)
      }
      updateData.title = trimmed || 'Untitled Image'
    }

    return prisma.artifact.update({
      where: { id: validArtifactId },
      data: updateData,
    })
  }

  static async deleteArtifact(artifactId: string) {
    const validArtifactId = assertValidUUID(artifactId, 'Artifact ID')
    await this.getArtifactById(validArtifactId)
    return prisma.artifact.delete({
      where: { id: validArtifactId },
    })
  }
}
