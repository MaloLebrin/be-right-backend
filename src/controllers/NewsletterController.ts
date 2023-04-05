import type { Request, Response } from 'express'
import type { EntityManager, Repository } from 'typeorm'
import { paginator, wrapperRequest } from '../utils'
import { APP_SOURCE } from '..'
import { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import { UserEntity } from '../entity/UserEntity'
import { ApiError } from '../middlewares/ApiError'
import { NewsletterRecipient, newsletterRecipientSearchableFields } from './../entity/NewsletterRecipientEntity'

export default class NewsletterController {
  getManager: EntityManager
  repository: Repository<NewsletterRecipient>
  UserRepository: Repository<UserEntity>

  constructor() {
    this.getManager = APP_SOURCE.manager
    this.repository = APP_SOURCE.getRepository(NewsletterRecipient)
    this.UserRepository = APP_SOURCE.getRepository(UserEntity)
  }

  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email, firstName, lastName, companyName }: { email: string; firstName: string; lastName: string; companyName: string } = req.body

      const newsletterRecipient = {
        email,
        firstName: firstName || undefined,
        lastName: lastName || undefined,
        companyName: companyName || undefined,
      }

      if (!newsletterRecipient) {
        throw new ApiError(422, 'paramètres manquant')
      }

      const recipientAlreadyExist = await this.repository.findOneBy({ email })

      if (recipientAlreadyExist) {
        throw new ApiError(423, 'cet email existe déjà')
      }

      const employee = await this.getManager.findOneBy(EmployeeEntity, { email })

      if (employee) {
        newsletterRecipient.firstName = employee.firstName
        newsletterRecipient.lastName = employee.lastName
      }

      const user = await this.UserRepository.findOne({
        where: {
          email,
        },
        relations: {
          company: true,
        },
      })
      if (user) {
        newsletterRecipient.firstName = user.firstName || undefined
        newsletterRecipient.lastName = user.lastName || undefined
        newsletterRecipient.companyName = user.company.name || undefined
      }

      const recipient = this.repository.create(newsletterRecipient)
      await this.repository.save(recipient)
      return res.status(200).json(recipient)
    })
  }

  public getAllPaginate = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { where, page, take, skip } = paginator(req, newsletterRecipientSearchableFields)

      const [newsletterRecipients, total] = await this.repository.findAndCount({
        take,
        skip,
        where: where || {},
      })

      return res.status(200).json({
        data: newsletterRecipients,
        currentPage: page,
        limit: take,
        total,
      })
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const recipient = await this.repository.findOne({ where: { id } })
      if (recipient) {
        await this.repository.softDelete(id)
        return res.status(204).json({ data: recipient, message: 'événement supprimé' })
      }
      throw new ApiError(401, 'Action non autorisée')
    })
  }
}
