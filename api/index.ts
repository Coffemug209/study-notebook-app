import type { VercelRequest, VercelResponse } from '@vercel/node'
import app from '../server/src/app.js'

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    return app(req as any, res as any)
  } catch (err: any) {
    console.error('[API Error]:', err)
    if (!res.headersSent) {
      res.status(500).json({
        error: err?.message || String(err),
        stack: err?.stack,
      })
    }
  }
}
