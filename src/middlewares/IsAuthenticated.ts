import type { NextFunction, Request, Response } from 'express'
import { getManager } from 'typeorm'
import { isUserEntity } from '../utils/index'
import Context from '../context'
import { UserEntity } from '../entity/UserEntity'

export default async function isAuthenticated(req: Request, res: Response, next: NextFunction) {
  if (req.headers.authorization) {
    const token = req.headers.authorization.replace('Bearer ', '')

    const user = await getManager().findOne(UserEntity, { token })
    if (user && isUserEntity(user)) {
      const ctx = Context.get(req)
      ctx.user = user
      return next()
    } else {
      return res.status(401).json({ error: 'unauthorized' })
    }
  } else {
    return res.status(401).json({ error: 'unauthorized' })
  }
}
