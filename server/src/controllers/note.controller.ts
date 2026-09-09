import type { Request, Response } from 'express'
import { NoteService } from '../services/note.service.js'

export class NoteController {
  static async getBySubject(req: Request, res: Response) {
    const subjectId = req.params.subjectId as string
    const notes = await NoteService.getNotesBySubject(subjectId)
    res.json({ success: true, data: notes })
  }

  static async getById(req: Request, res: Response) {
    const noteId = req.params.noteId as string
    const note = await NoteService.getNoteById(noteId)
    res.json({ success: true, data: note })
  }

  static async create(req: Request, res: Response) {
    const subjectId = req.params.subjectId as string
    const { title, content } = req.body
    const note = await NoteService.createNote(subjectId, title, content)
    res.status(201).json({ success: true, data: note })
  }

  static async update(req: Request, res: Response) {
    const noteId = req.params.noteId as string
    const { title, content } = req.body
    const note = await NoteService.updateNote(noteId, { title, content })
    res.json({ success: true, data: note })
  }

  static async delete(req: Request, res: Response) {
    const noteId = req.params.noteId as string
    await NoteService.deleteNote(noteId)
    res.json({ success: true, message: 'Note deleted successfully' })
  }
}
