import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'
import { wrapperRequest } from '../utils'
import { CompanyEntity } from '../entity/Company.entity'
import { UserEntity } from '../entity/UserEntity'
import { CompanyService } from '../services/CompanyService'
import { ApiError } from '../middlewares/ApiError'
import Context from '../context'
import { APP_SOURCE } from '..'
import { Role } from '../types'
import { isUserAdmin, isUserOwner } from '../utils/userHelper'

export class CompanyController {
  CompanyService: CompanyService
  repository: Repository<CompanyEntity>
  UserRepository: Repository<UserEntity>

  constructor() {
    this.CompanyService = new CompanyService(APP_SOURCE)
    this.repository = APP_SOURCE.getRepository(CompanyEntity)
    this.UserRepository = APP_SOURCE.getRepository(UserEntity)
  }

  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      if (id) {
        const company = await this.CompanyService.getOne(id)

        return res.status(200).json(company)
      }

      throw new ApiError(422, 'L\'identifiant de l\'entreprise est requis')
    })
  }

  public addOrRemoveOwner = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      const ctx = Context.get(req)

      const companyId = ctx.user.companyId

      if (!id || !companyId) {
        throw new ApiError(422, 'L\'identifiant de l\'utilisateur est requis')
      }

      const company = await this.repository.findOne({
        where: { id: companyId },
        relations: {
          users: true,
        },
      })

      if (!company) {
        throw new ApiError(422, 'L\'entreprise n\'éxiste pas')
      }

      const user = await this.UserRepository.findOne({
        where: {
          id,
          company: {
            id: company.id,
          },
        },
      })

      if (!user) {
        throw new ApiError(422, 'L\'utilisateur n\'éxiste pas')
      }

      if (isUserAdmin(user)) {
        throw new ApiError(401, 'Vous ne pouvez pas changer le rôle de cet utilisateur')
      }

      if (!company.userIds.includes(user.id)) {
        throw new ApiError(422, 'L\'utilisateur ne vous appartient pas')
      }

      user.roles = isUserOwner(user) ? Role.USER : Role.OWNER

      const userToSend = await this.UserRepository.save(user)

      return res.status(200).json({
        user: userToSend,
        company,
      })
    })
  }

  public patchOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      const ctx = Context.get(req)

      const companyId = ctx.user.companyId
      if (id && companyId) {
        if (id !== companyId) {
          throw new ApiError(401, 'Action non autorisée')
        }

        const { company }: { company: Partial<CompanyEntity> } = req.body

        if (!company) {
          throw new ApiError(422, 'Les informations de l\'entreprise sont requis')
        }

        await this.repository.update(id, company)

        const companyUpdated = await this.CompanyService.getOne(id)

        return res.status(200).json(companyUpdated)
      }
      throw new ApiError(422, 'L\'identifiant de l\'entreprise est requis')
    })
  }
}
