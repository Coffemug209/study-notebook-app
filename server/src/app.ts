import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import apiRouter from './routes/index.js'
import { errorHandler, AppError } from './middleware/errorHandler.js'

export const app = express()

// Production-safe CORS Configuration
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, server-to-server, mobile)
    if (!origin) return callback(null, true)
    if (
      allowedOrigins.length === 0 ||
      allowedOrigins.includes('*') ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      origin.includes('localhost')
    ) {
      return callback(null, true)
    }
    return callback(new AppError(`Origin ${origin} not allowed by CORS`, 403))
  },
  credentials: true,
}))

// JSON Body Parser with DoS limit
app.use(express.json({ limit: '2mb' }))

// Mount API routes under /api and root / so both standalone and serverless environments work
app.use('/api', apiRouter)
app.use('/', apiRouter)

// Catch-all for unhandled routes
app.use((_req, _res, next) => {
  next(new AppError('Endpoint not found', 404))
})

// Centralized Error Middleware
app.use(errorHandler)

export default app
