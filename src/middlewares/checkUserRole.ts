import type { NextFunction, Request, Response } from 'express'
import type { Role } from '../types/Role'
import Context from '../context'

export default function checkUserRole(role: Role) {
  return (req: Request, res: Response, next: NextFunction) => {
    const ctx = Context.get(req)
    if (ctx.user && ctx.user.roles === role) {
      return next()
    } else {
      return res.status(401).send('Not Allowed')
    }
  }
}
