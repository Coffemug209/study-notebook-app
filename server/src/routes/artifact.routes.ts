import { Router } from 'express'
import { ArtifactController } from '../controllers/artifact.controller.js'

// Router for /api/artifacts
export const artifactRouter = Router()
artifactRouter.get('/:artifactId', ArtifactController.getById)
artifactRouter.patch('/:artifactId', ArtifactController.update)
artifactRouter.delete('/:artifactId', ArtifactController.delete)

// Router for /api/subjects/:subjectId/artifacts
export const subjectArtifactRouter = Router({ mergeParams: true })
subjectArtifactRouter.get('/', ArtifactController.getBySubject)

// Router for /api/notes/:noteId/artifacts
export const noteArtifactRouter = Router({ mergeParams: true })
noteArtifactRouter.post('/', ArtifactController.create)

export default artifactRouter
