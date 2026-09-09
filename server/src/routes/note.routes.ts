import { Router } from 'express'
import { NoteController } from '../controllers/note.controller.js'

// Router for /api/notes
export const noteRouter = Router()
noteRouter.get('/:noteId', NoteController.getById)
noteRouter.patch('/:noteId', NoteController.update)
noteRouter.delete('/:noteId', NoteController.delete)

// Router for /api/subjects/:subjectId/notes (mergeParams = true)
export const subjectNoteRouter = Router({ mergeParams: true })
subjectNoteRouter.get('/', NoteController.getBySubject)
subjectNoteRouter.post('/', NoteController.create)

export default noteRouter
