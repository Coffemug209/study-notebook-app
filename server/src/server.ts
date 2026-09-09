import 'dotenv/config'
import app from './app.js'
import { prisma } from './lib/prisma.js'

// ── Environment Validation ──────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production'

if (isProduction) {
  const required = ['DATABASE_URL', 'UPLOADTHING_TOKEN']
  const missing = required.filter(key => !process.env[key])
  if (missing.length > 0) {
    console.error(
      `[FATAL] Missing required environment variables: ${missing.join(', ')}. ` +
      `Server cannot start in production mode without them.`
    )
    process.exit(1)
  }
}

const PORT = Number(process.env.PORT) || 5000

// ── Startup ─────────────────────────────────────────────────────────────────
const server = app.listen(PORT, async () => {
  console.log(`[server] Study Organizer API running on http://localhost:${PORT}`)
  console.log(`[server] Environment: ${process.env.NODE_ENV ?? 'development'}`)

  // Verify database connectivity on startup
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('[server] Database connection: OK')
  } catch (err) {
    console.warn('[server] Database connection check failed — Neon will reconnect on first request:', (err as Error).message)
  }
})

// ── Graceful Shutdown ────────────────────────────────────────────────────────
async function gracefulShutdown(signal: string) {
  console.log(`[server] Received ${signal}. Shutting down gracefully...`)

  // Force-exit if shutdown takes longer than 10 seconds
  const forceExitTimer = setTimeout(() => {
    console.error('[server] Graceful shutdown timed out (10s). Forcing exit.')
    process.exit(1)
  }, 10_000)
  forceExitTimer.unref()

  server.close(async () => {
    try {
      await prisma.$disconnect()
      console.log('[server] Database disconnected. Server stopped cleanly.')
    } catch (err) {
      console.error('[server] Error during Prisma disconnect:', err)
    } finally {
      process.exit(0)
    }
  })
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
process.on('SIGINT', () => gracefulShutdown('SIGINT'))

// Catch uncaught exceptions to log them before dying
process.on('uncaughtException', (err) => {
  console.error('[server] Uncaught Exception:', err)
  gracefulShutdown('uncaughtException')
})

process.on('unhandledRejection', (reason) => {
  console.error('[server] Unhandled Promise Rejection:', reason)
})

export default server
