import type { NextFunction, Request, Response } from 'express'
import { verify } from 'jsonwebtoken'
import { isUserEntity } from '../utils/index'
import Context from '../context'
import { UserEntity } from '../entity/UserEntity'
import { APP_SOURCE, REDIS_CACHE } from '..'
import { useEnv } from '../env'
import { logger } from './loggerService'
import { ApiError } from './ApiError'

export default async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  try {
    logger.info(`${req.url} check auth started`)

    if (req.headers.authorization) {
      const token = req.headers.authorization.replace('Bearer ', '')

      if (!token) {
        throw new ApiError(401, 'action non autorisée')
      }
      const { JWT_SECRET } = useEnv()
      verify(token, JWT_SECRET)

      if (token) {
        const user = await REDIS_CACHE.get<UserEntity>(
          `user-token-${token}`,
          () => APP_SOURCE.getRepository(UserEntity).findOne({
            where: { token },
            relations: {
              company: true,
            },
            loadRelationIds: true,
          }))

        console.log(user, '<==== user')
        if (user && isUserEntity(user)) {
          const ctx = Context.get(req)
          ctx.user = user

          logger.info(`${req.url} User is allowed`)
          return next()
        }
      }
    }
    return res.status(401).send({
      success: false,
      message: 'Action non autorisée',
    })
  } catch (error) {
    logger.debug(error.message)

    logger.error(error)

    return res.status(401).send({
      success: false,
      message: 'Action non autorisée',
      stack: error.stack,
      description: error.cause,
    })
  } finally {
    logger.info(`${req.url} check auth ended`)
  }
}
