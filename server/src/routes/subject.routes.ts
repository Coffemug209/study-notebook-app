import { Router } from 'express'
import { SubjectController } from '../controllers/subject.controller.js'

const router = Router()

router.get('/', SubjectController.getAll)
router.post('/', SubjectController.create)
router.patch('/reorder', SubjectController.reorder)
router.get('/:subjectId', SubjectController.getById)
router.patch('/:subjectId', SubjectController.update)
router.delete('/:subjectId', SubjectController.delete)

export default router
