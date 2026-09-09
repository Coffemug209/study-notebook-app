import { prisma } from '../lib/prisma.js'
import { AppError } from '../middleware/errorHandler.js'
import {
  assertValidUUID,
  validateSubjectName,
  validateOrderedIds,
} from '../middleware/validate.js'

export class SubjectService {
  static async getAllSubjects() {
    return prisma.subject.findMany({
      orderBy: { position: 'asc' },
    })
  }

  static async getSubjectById(id: string) {
    const validId = assertValidUUID(id, 'Subject ID')
    const subject = await prisma.subject.findUnique({
      where: { id: validId },
      include: {
        notes: { orderBy: { updatedAt: 'desc' } },
        artifacts: { orderBy: { updatedAt: 'desc' } },
      },
    })
    if (!subject) {
      throw new AppError(`Subject with ID '${validId}' not found`, 404)
    }
    return subject
  }

  static async createSubject(name: unknown) {
    const validName = validateSubjectName(name)

    const count = await prisma.subject.count()
    return prisma.subject.create({
      data: {
        name: validName,
        position: count,
      },
    })
  }

  static async updateSubject(id: string, data: { name?: unknown; position?: unknown }) {
    const validId = assertValidUUID(id, 'Subject ID')
    await this.getSubjectById(validId)

    const updateData: { name?: string; position?: number } = {}

    if (data.name !== undefined) {
      updateData.name = validateSubjectName(data.name)
    }

    if (data.position !== undefined) {
      if (typeof data.position !== 'number' || data.position < 0 || !Number.isInteger(data.position)) {
        throw new AppError('Position must be a non-negative integer', 400)
      }
      updateData.position = data.position
    }

    return prisma.subject.update({
      where: { id: validId },
      data: updateData,
    })
  }

  static async deleteSubject(id: string) {
    const validId = assertValidUUID(id, 'Subject ID')
    await this.getSubjectById(validId)
    return prisma.subject.delete({
      where: { id: validId },
    })
  }

  static async reorderSubjects(orderedIds: unknown) {
    const validatedIds = validateOrderedIds(orderedIds)

    // Verify that the count of IDs matches total subjects in DB
    const totalSubjects = await prisma.subject.count()
    if (validatedIds.length !== totalSubjects) {
      throw new AppError(
        `orderedIds count (${validatedIds.length}) does not match existing subject count (${totalSubjects})`,
        400
      )
    }

    const updates = validatedIds.map((id, index) =>
      prisma.subject.update({
        where: { id },
        data: { position: index },
      })
    )

    return prisma.$transaction(updates)
  }
}
