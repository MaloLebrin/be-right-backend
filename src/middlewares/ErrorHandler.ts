import type { NextFunction, Request, Response } from 'express'
import { isProduction } from '../utils/envHelper'
import type { ErrorResponse } from '../types/Errors'
import { ErrorType } from '../types/Errors'
import { ApiError } from './ApiError'
import { logger } from './loggerService'

export function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
  const errorResponse: ErrorResponse = {
    status: 500,
    type: ErrorType.INTERNAL_SERVER_ERROR,
    message: 'Internal Server Error',
  }

  // Si c'est une erreur API personnalisée
  if (err instanceof ApiError) {
    errorResponse.status = err.statusCode
    errorResponse.type = err.type
    errorResponse.message = err.message
    errorResponse.details = err.details
  } else {
    // Pour les erreurs non-API, on masque les détails en production
    if (!isProduction()) {
      errorResponse.message = err.message
      errorResponse.stack = err.stack
    }
  }

  // Logging structuré
  logger.error({
    error: {
      message: errorResponse.message,
      type: errorResponse.type,
      status: errorResponse.status,
      details: errorResponse.details,
      stack: errorResponse.stack,
      path: req.path,
      method: req.method,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
  })

  // En production, on ne renvoie pas la stack trace
  if (isProduction()) {
    delete errorResponse.stack
  }

  // Réponse d'erreur
  res.status(errorResponse.status).json({
    error: errorResponse,
  })

  // On appelle next pour permettre à d'autres middlewares de gérer l'erreur si nécessaire
  next(err)
}
