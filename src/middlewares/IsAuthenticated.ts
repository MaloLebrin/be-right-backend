import type { NextFunction, Request, Response } from 'express'
import { getManager } from 'typeorm'
import { isUserEntity } from '../utils/index'
import Context from '../context'
import { UserEntity } from '../entity/UserEntity'
import { useLogger } from './loggerService'

export default async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const { logger } = useLogger()
  logger.info(`${req.url} check auth started`)

  if (req.headers.authorization) {
    const token = req.headers.authorization.replace('Bearer ', '')
    const user = await getManager().findOne(UserEntity, { token })
    if (user && isUserEntity(user)) {
      const ctx = Context.get(req)
      ctx.user = user
      logger.info(`${req.url} User is allowed`)
      return next()
    } else {
      logger.debug('user no allowed')
      return res.status(401).json({ error: 'unauthorized' })
    }
  } else {
    logger.debug('user no allowed')
    return res.status(401).json({ error: 'unauthorized' })
  }
}
