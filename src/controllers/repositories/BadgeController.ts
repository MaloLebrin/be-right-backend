import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'
import { In } from 'typeorm'
import { APP_SOURCE } from '../..'
import Context from '../../context'
import { BadgeEntity } from '../../entity/repositories/Badge.entity'
import { ApiError } from '../../middlewares/ApiError'
import { wrapperRequest } from '../../utils'

export class BadgeController {
  repository: Repository<BadgeEntity>

  constructor() {
    this.repository = APP_SOURCE.getRepository(BadgeEntity)
  }

  public getAll = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const badges = await this.repository.find()
      return res.status(200).json(badges)
    })
  }

  public getAllForUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)

      if (!ctx?.user) {
        throw new ApiError(401, 'vous n\'êtes pas identifié')
      }

      if (ctx.user) {
        const badges = await this.repository.find({
          where: {
            id: In(ctx.user.badgeIds),
          },
        })
        return res.status(200).json(badges)
      }
      throw new ApiError(422, 'L\'identifiant de l\'utilisateur est requis')
    })
  }
}
