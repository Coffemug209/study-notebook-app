import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const { default: app } = await import('../server/src/app.js')
    res.status(200).json({ status: 'ok', appType: typeof app })
  } catch (err: any) {
    res.status(500).json({
      error: err?.message || String(err),
      stack: err?.stack,
      name: err?.name,
    })
  }
}
