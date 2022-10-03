import type { NextFunction, Request, Response } from 'express'
import type { Role } from '../types/Role'
import Context from '../context'
import { useLogger } from './loggerService'

export default function checkUserRole(role: Role) {
  const { logger } = useLogger()

  return (req: Request, res: Response, next: NextFunction) => {
    logger.info(`${req.url} checkRole started`)
    const ctx = Context.get(req)
    if (ctx.user && ctx.user.roles === role) {
      return next()
    } else {
      logger.debug('user no allowed')
      return res.status(401).send('Not Allowed')
    }
  }
}
