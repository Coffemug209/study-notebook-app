import type { Request, Response } from 'express'
import { SubjectService } from '../services/subject.service.js'

export class SubjectController {
  static async getAll(_req: Request, res: Response) {
    const subjects = await SubjectService.getAllSubjects()
    res.json({ success: true, data: subjects })
  }

  static async getById(req: Request, res: Response) {
    const subjectId = req.params.subjectId as string
    const subject = await SubjectService.getSubjectById(subjectId)
    res.json({ success: true, data: subject })
  }

  static async create(req: Request, res: Response) {
    const { name } = req.body
    const subject = await SubjectService.createSubject(name)
    res.status(201).json({ success: true, data: subject })
  }

  static async update(req: Request, res: Response) {
    const subjectId = req.params.subjectId as string
    const { name, position } = req.body
    const subject = await SubjectService.updateSubject(subjectId, { name, position })
    res.json({ success: true, data: subject })
  }

  static async delete(req: Request, res: Response) {
    const subjectId = req.params.subjectId as string
    await SubjectService.deleteSubject(subjectId)
    res.json({ success: true, message: 'Subject deleted successfully' })
  }

  static async reorder(req: Request, res: Response) {
    const { orderedIds } = req.body
    const result = await SubjectService.reorderSubjects(orderedIds)
    res.json({ success: true, data: result })
  }
}
