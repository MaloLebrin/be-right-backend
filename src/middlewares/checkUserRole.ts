import type { NextFunction, Request, Response } from 'express'
import type { Role } from '../types/Role'
import Context from '../context'
import { isArray } from '../utils/arrayHelper'
import { logger } from './loggerService'
import { ApiError } from './ApiError'

export default function checkUserRole(roles: Role | Role[]) {
  return (req: Request, _: Response, next: NextFunction) => {
    logger.info(`${req.url} checkRole started`)
    const ctx = Context.get(req)

    const user = ctx.user
    if (user && user.roles) {
      if (isArray(roles)) {
        if (roles.includes(user.roles)) {
          return next()
        }
        throw new ApiError(401, 'Action non autorisée')
      } else {
        if (user.roles === roles) {
          return next()
        }
        throw new ApiError(401, 'Action non autorisée')
      }
    } else {
      logger.debug('user no allowed')
      throw new ApiError(401, 'Action non autorisée')
    }
  }
}
