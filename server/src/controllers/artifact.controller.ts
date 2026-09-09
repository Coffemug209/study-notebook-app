import type { Request, Response } from 'express'
import { ArtifactService } from '../services/artifact.service.js'

export class ArtifactController {
  static async getBySubject(req: Request, res: Response) {
    const subjectId = req.params.subjectId as string
    const artifacts = await ArtifactService.getArtifactsBySubject(subjectId)
    res.json({ success: true, data: artifacts })
  }

  static async getById(req: Request, res: Response) {
    const artifactId = req.params.artifactId as string
    const artifact = await ArtifactService.getArtifactById(artifactId)
    res.json({ success: true, data: artifact })
  }

  static async create(req: Request, res: Response) {
    const noteId = req.params.noteId as string
    const { title, fileKey, fileUrl, mimeType } = req.body
    const artifact = await ArtifactService.createArtifactForNote(noteId, {
      title,
      fileKey,
      fileUrl,
      mimeType,
    })
    res.status(201).json({ success: true, data: artifact })
  }

  static async update(req: Request, res: Response) {
    const artifactId = req.params.artifactId as string
    const { title } = req.body
    const artifact = await ArtifactService.updateArtifact(artifactId, { title })
    res.json({ success: true, data: artifact })
  }

  static async delete(req: Request, res: Response) {
    const artifactId = req.params.artifactId as string
    await ArtifactService.deleteArtifact(artifactId)
    res.json({ success: true, message: 'Artifact deleted successfully' })
  }
}
