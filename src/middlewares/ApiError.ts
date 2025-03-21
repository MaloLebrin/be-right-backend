import type { ApiErrorDetails } from '../types/Errors'
import { ErrorType } from '../types/Errors'

export class ApiError extends Error {
  statusCode: number
  type: ErrorType
  details?: Record<string, any>

  constructor(statusCode: number, message: string, type: ErrorType = ErrorType.INTERNAL_SERVER_ERROR, details?: Record<string, any>) {
    super(message)
    this.statusCode = statusCode
    this.type = type
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON(): ApiErrorDetails {
    return {
      code: this.type,
      message: this.message,
      details: this.details,
    }
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(400, message, ErrorType.VALIDATION_ERROR, details)
  }
}

export class AuthenticationError extends ApiError {
  constructor(message = 'Authentication failed', details?: Record<string, any>) {
    super(401, message, ErrorType.AUTHENTICATION_ERROR, details)
  }
}

export class AuthorizationError extends ApiError {
  constructor(message = 'Not authorized', details?: Record<string, any>) {
    super(403, message, ErrorType.AUTHORIZATION_ERROR, details)
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string, details?: Record<string, any>) {
    super(404, `${resource} not found`, ErrorType.NOT_FOUND_ERROR, details)
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(409, message, ErrorType.CONFLICT_ERROR, details)
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(500, message, ErrorType.DATABASE_ERROR, details)
  }
}

export class ExternalServiceError extends ApiError {
  constructor(service: string, message: string, details?: Record<string, any>) {
    super(502, `${service} service error: ${message}`, ErrorType.EXTERNAL_SERVICE_ERROR, details)
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string, details?: Record<string, any>) {
    super(429, message, ErrorType.RATE_LIMIT_ERROR, details)
  }
}
