import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import apiRouter from './routes/index.js'
import { errorHandler, AppError } from './middleware/errorHandler.js'

export const app = express()

// Production-safe CORS Configuration
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim())

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true)
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true)
    }
    return callback(new AppError(`Origin ${origin} not allowed by CORS`, 403))
  },
  credentials: true,
}))

// JSON Body Parser with DoS limit
app.use(express.json({ limit: '2mb' }))

// Mount API routes under /api
app.use('/api', apiRouter)

// Catch-all for unhandled routes
app.use((_req, _res, next) => {
  next(new AppError('Endpoint not found', 404))
})

// Centralized Error Middleware
app.use(errorHandler)

export default app
