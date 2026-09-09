import type { Request, Response, NextFunction } from 'express'
import { Prisma } from '../generated/prisma/index.js'

export class AppError extends Error {
  public statusCode: number
  public isOperational: boolean

  constructor(message: string, statusCode = 400) {
    super(message)
    this.statusCode = statusCode
    this.isOperational = true
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export function errorHandler(
  err: Error | AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const isProduction = process.env.NODE_ENV === 'production'

  let statusCode = 500
  let message = 'Internal server error'

  if (err instanceof AppError) {
    statusCode = err.statusCode
    message = err.message
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2025':
        statusCode = 404
        message = 'Requested record was not found'
        break
      case 'P2002':
        statusCode = 409
        message = 'A resource with this unique constraint already exists'
        break
      case 'P2003':
        statusCode = 400
        message = 'Foreign key constraint failed'
        break
      case 'P2023':
        statusCode = 400
        message = 'Invalid input data format or UUID'
        break
      default:
        statusCode = 400
        message = isProduction ? 'Database operation failed' : err.message
        break
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400
    message = isProduction ? 'Invalid request data' : err.message
  } else if (err.name === 'SyntaxError' && 'body' in err) {
    // Malformed JSON payload
    statusCode = 400
    message = 'Malformed JSON body in request'
  } else {
    if (!isProduction) {
      message = err.message || 'Internal server error'
    }
  }

  // Never log sensitive tokens or secrets to console
  if (statusCode >= 500) {
    console.error('Unhandled Server Error:', {
      name: err.name,
      message: err.message,
      stack: isProduction ? undefined : err.stack,
    })
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      statusCode,
      ...(!isProduction && { stack: err.stack }),
    },
  })
}
