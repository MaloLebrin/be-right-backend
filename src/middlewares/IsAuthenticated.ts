import type { NextFunction, Request, Response } from 'express'
import { verify } from 'jsonwebtoken'
import { isUserEntity } from '../utils/index'
import Context from '../context'
import { UserEntity } from '../entity/UserEntity'
import { APP_SOURCE, REDIS_CACHE } from '..'
import { useEnv } from '../env'
import { useLogger } from './loggerService'

export default async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  const { logger } = useLogger()
  const { JWT_SECRET } = useEnv()
  logger.info(`${req.url} check auth started`)

  if (req.headers.authorization) {
    const token = req.headers.authorization.replace('Bearer ', '')

    const verifyToken = verify(token, JWT_SECRET)

    logger.debug(verifyToken)

    const user = await REDIS_CACHE.get<UserEntity>(
      `user-token-${token}`,
      () => APP_SOURCE.getRepository(UserEntity).findOne({ where: { token } }))

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
