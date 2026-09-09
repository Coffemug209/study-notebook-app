import { prisma } from '../lib/prisma.js'
import { AppError } from '../middleware/errorHandler.js'
import {
  assertValidUUID,
  validateNoteTitle,
  validateTiptapContent,
} from '../middleware/validate.js'
import type { Prisma } from '../generated/prisma/index.js'

export class NoteService {
  static async getNotesBySubject(subjectId: string) {
    const validSubjectId = assertValidUUID(subjectId, 'Subject ID')
    const subject = await prisma.subject.findUnique({ where: { id: validSubjectId } })
    if (!subject) {
      throw new AppError(`Subject with ID '${validSubjectId}' not found`, 404)
    }

    return prisma.note.findMany({
      where: { subjectId: validSubjectId },
      orderBy: { updatedAt: 'desc' },
      include: {
        artifacts: true,
      },
    })
  }

  static async getNoteById(noteId: string) {
    const validNoteId = assertValidUUID(noteId, 'Note ID')
    const note = await prisma.note.findUnique({
      where: { id: validNoteId },
      include: {
        artifacts: true,
        subject: true,
      },
    })
    if (!note) {
      throw new AppError(`Note with ID '${validNoteId}' not found`, 404)
    }
    return note
  }

  static async createNote(subjectId: string, title: unknown, content: unknown) {
    const validSubjectId = assertValidUUID(subjectId, 'Subject ID')
    const subject = await prisma.subject.findUnique({ where: { id: validSubjectId } })
    if (!subject) {
      throw new AppError(`Subject with ID '${validSubjectId}' not found`, 404)
    }

    const validTitle = validateNoteTitle(title)
    const validContent = validateTiptapContent(content)

    return prisma.note.create({
      data: {
        subjectId: validSubjectId,
        title: validTitle,
        content: validContent as Prisma.InputJsonValue,
      },
      include: {
        artifacts: true,
      },
    })
  }

  static async updateNote(
    noteId: string,
    data: { title?: unknown; content?: unknown }
  ) {
    const validNoteId = assertValidUUID(noteId, 'Note ID')
    await this.getNoteById(validNoteId)

    const updateData: { title?: string; content?: Prisma.InputJsonValue } = {}

    if (data.title !== undefined) {
      updateData.title = validateNoteTitle(data.title)
    }

    if (data.content !== undefined) {
      updateData.content = validateTiptapContent(data.content) as Prisma.InputJsonValue
    }

    return prisma.note.update({
      where: { id: validNoteId },
      data: updateData,
      include: {
        artifacts: true,
      },
    })
  }

  static async deleteNote(noteId: string) {
    const validNoteId = assertValidUUID(noteId, 'Note ID')
    await this.getNoteById(validNoteId)
    return prisma.note.delete({
      where: { id: validNoteId },
    })
  }
}
