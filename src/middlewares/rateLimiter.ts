import rateLimit from 'express-rate-limit'
import { Request, Response, NextFunction } from 'express'
import { isProduction } from '../utils/envHelper'

/**
 * General rate limiter
 */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isProduction() ? 100 : 0, // 100 requêtes par fenêtre en production, illimité en dev
  message: 'Trop de requêtes, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Strict rate limiter for authentication routes
 */
export const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: isProduction() ? 5 : 0, // 5 tentatives par heure en production
  message: 'Trop de tentatives de connexion, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Rate limiter for sensitive API routes
 */
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: isProduction() ? 30 : 0, // 30 requêtes par minute en production
  message: 'Limite de requêtes API atteinte, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
})

/**
 * Middleware to handle rate limiting errors
 */
export const rateLimitErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err.name === 'RateLimitExceeded') {
    return res.status(429).json({
      error: 'Too Many Requests',
      message: err.message,
      retryAfter: Math.ceil(err.retryAfter / 1000),
    })
  }
  next(err)
} 
