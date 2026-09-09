import { Router, type Request, type Response } from 'express'
import { prisma } from '../lib/prisma.js'
import subjectRouter from './subject.routes.js'
import { noteRouter, subjectNoteRouter } from './note.routes.js'
import { artifactRouter, subjectArtifactRouter, noteArtifactRouter } from './artifact.routes.js'
import uploadthingRouter from './uploadthing.routes.js'

const apiRouter = Router()

// Health check endpoint — safe for production probes (no secrets exposed)
apiRouter.get('/health', async (_req: Request, res: Response) => {
  let dbStatus = 'disconnected'
  try {
    await prisma.$queryRaw`SELECT 1`
    dbStatus = 'connected'
  } catch {
    dbStatus = 'error'
  }

  res.json({
    status: 'ok',
    database: dbStatus,
    service: 'Study Organizer API',
    version: '1.0.0',
    environment: process.env.NODE_ENV ?? 'development',
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  })
})

// Mount feature routers
apiRouter.use('/uploadthing', uploadthingRouter)
apiRouter.use('/subjects', subjectRouter)
apiRouter.use('/subjects/:subjectId/notes', subjectNoteRouter)
apiRouter.use('/subjects/:subjectId/artifacts', subjectArtifactRouter)
apiRouter.use('/notes', noteRouter)
apiRouter.use('/notes/:noteId/artifacts', noteArtifactRouter)
apiRouter.use('/artifacts', artifactRouter)

export default apiRouter
