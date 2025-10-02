/**
 * Error Handling Utilities
 * 
 * Provides centralized error handling for API routes and client-side operations.
 * Includes error logging, user-friendly error messages, and error recovery strategies.
 */

/**
 * Custom error types
 */
export class ApiError extends Error {
  public statusCode: number
  public code: string
  public details?: any

  constructor(message: string, statusCode: number = 500, code: string = 'INTERNAL_ERROR', details?: any) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.code = code
    this.details = details
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, id?: string) {
    const message = id ? `${resource} with ID ${id} not found` : `${resource} not found`
    super(message, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message: string = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED')
    this.name = 'UnauthorizedError'
  }
}

export class ForbiddenError extends ApiError {
  constructor(message: string = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN')
    this.name = 'ForbiddenError'
  }
}

/**
 * Error response interface
 */
export interface ErrorResponse {
  success: false
  error: string
  code?: string
  details?: any
  timestamp: string
  path?: string
}

/**
 * Success response interface
 */
export interface SuccessResponse<T = any> {
  success: true
  data: T
  message?: string
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
}

/**
 * API response type
 */
export type ApiResponse<T = any> = SuccessResponse<T> | ErrorResponse

/**
 * Creates a standardized error response
 */
export function createErrorResponse(
  error: Error | ApiError,
  path?: string
): ErrorResponse {
  const timestamp = new Date().toISOString()
  
  if (error instanceof ApiError) {
    return {
      success: false,
      error: error.message,
      code: error.code,
      details: error.details,
      timestamp,
      path
    }
  }

  // Handle Mongoose validation errors
  if (error.name === 'ValidationError') {
    const validationErrors = Object.values((error as any).errors).map((err: any) => ({
      field: err.path,
      message: err.message
    }))
    
    return {
      success: false,
      error: 'Validation failed',
      code: 'VALIDATION_ERROR',
      details: validationErrors,
      timestamp,
      path
    }
  }

  // Handle Mongoose duplicate key errors
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    const field = Object.keys((error as any).keyPattern)[0]
    return {
      success: false,
      error: `${field} already exists`,
      code: 'DUPLICATE_KEY',
      timestamp,
      path
    }
  }

  // Handle Mongoose cast errors
  if (error.name === 'CastError') {
    return {
      success: false,
      error: 'Invalid ID format',
      code: 'INVALID_ID',
      timestamp,
      path
    }
  }

  // Default error response
  return {
    success: false,
    error: process.env.NODE_ENV === 'production' 
      ? 'An unexpected error occurred' 
      : error.message,
    code: 'INTERNAL_ERROR',
    timestamp,
    path
  }
}

/**
 * Creates a standardized success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  pagination?: {
    page: number
    limit: number
    total: number
    pages: number
  }
): SuccessResponse<T> {
  return {
    success: true,
    data,
    message,
    pagination
  }
}

/**
 * Error handler middleware for API routes
 */
export function handleApiError(error: Error, path?: string) {
  console.error(`API Error at ${path || 'unknown path'}:`, {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })

  const errorResponse = createErrorResponse(error, path)
  
  return {
    status: error instanceof ApiError ? error.statusCode : 500,
    body: errorResponse
  }
}

/**
 * Async error wrapper for API route handlers
 */
export function withErrorHandling<T extends any[], R>(
  handler: (...args: T) => Promise<R>
) {
  return async (...args: T): Promise<R> => {
    try {
      return await handler(...args)
    } catch (error) {
      console.error('Unhandled error in API route:', error)
      throw error
    }
  }
}

/**
 * Validates required fields in request body
 */
export function validateRequiredFields(
  body: any,
  requiredFields: string[]
): void {
  const missingFields = requiredFields.filter(field => 
    body[field] === undefined || body[field] === null || body[field] === ''
  )

  if (missingFields.length > 0) {
    throw new ValidationError(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields }
    )
  }
}

/**
 * Validates MongoDB ObjectId format
 */
export function validateObjectId(id: string, fieldName: string = 'ID'): void {
  if (!id || typeof id !== 'string') {
    throw new ValidationError(`${fieldName} is required`)
  }

  if (!/^[0-9a-fA-F]{24}$/.test(id)) {
    throw new ValidationError(`Invalid ${fieldName} format`)
  }
}

/**
 * Validates pagination parameters
 */
export function validatePaginationParams(params: any): {
  page: number
  limit: number
  skip: number
} {
  const page = Math.max(1, parseInt(params.page) || 1)
  const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}

/**
 * Client-side error handler
 */
export function handleClientError(error: Error, context?: string): void {
  console.error(`Client Error${context ? ` in ${context}` : ''}:`, {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString()
  })

  // In a real application, you might want to send this to an error reporting service
  // like Sentry, LogRocket, or similar
}

/**
 * Retry utility for failed API calls
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      if (attempt === maxRetries) {
        break
      }

      // Don't retry on client errors (4xx)
      if (error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500) {
        break
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt))
    }
  }

  throw lastError!
}

/**
 * Timeout utility for API calls
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = 10000
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new ApiError('Request timeout', 408, 'TIMEOUT')), timeoutMs)
    )
  ])
}
