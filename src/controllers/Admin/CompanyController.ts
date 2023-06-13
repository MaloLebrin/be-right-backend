import type { DataSource, Repository } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { CompanyEntity } from '../../entity/Company.entity'
import { ApiError } from '../../middlewares/ApiError'
import { wrapperRequest } from '../../utils'
import { BaseAdminController } from './BaseAdminController'

export class AdminCompanyController extends BaseAdminController {
  private CompanyRepository: Repository<CompanyEntity>

  constructor(SOURCE: DataSource) {
    super(SOURCE)
    this.CompanyRepository = SOURCE.getRepository(CompanyEntity)
  }

  public deleteCompany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)

      if (!id) {
        throw new ApiError(422, 'L\'identifiant de l\'entreprise est requis')
      }

      const isExist = await this.CompanyRepository.exist({ where: { id } })

      if (!isExist) {
        return res.status(201).json({
          success: true,
          message: 'Entreprise déjà supprimée',
        })
      }

      await this.CompanyRepository.softDelete(id)

      return res.status(201).json({
        success: true,
        message: 'Entreprise supprimée',
      })
    })
  }
}
