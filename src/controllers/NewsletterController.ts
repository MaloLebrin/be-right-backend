import type { Request, Response } from 'express'
import type { EntityManager, FindOptionsWhere, Repository } from 'typeorm'
import { paginator, wrapperRequest } from '../utils'
import { APP_SOURCE } from '..'
import { EmployeeEntity } from '../entity/EmployeeEntity'
import { UserEntity } from '../entity/UserEntity'
import { NewsletterRecipient, newsletterRecipientSearchableFields } from './../entity/NewsletterRecipientEntity'

export default class NewsletterController {
  getManager: EntityManager
  repository: Repository<NewsletterRecipient>

  constructor() {
    this.getManager = APP_SOURCE.manager
    this.repository = APP_SOURCE.getRepository(NewsletterRecipient)
  }

  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email, firstName, lastName, companyName }: { email: string; firstName: string; lastName: string; companyName: string } = req.body

      const newsletterRecipient = {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        companyName: companyName || null,
      }

      const recipientAlreadyExist = await this.repository.findOneBy({ email })

      if (recipientAlreadyExist) {
        return res.status(422).json({ error: 'cet email existe déjà' })
      }

      const employee = await this.getManager.findOneBy(EmployeeEntity, { email })

      if (employee) {
        newsletterRecipient.firstName = employee.firstName
        newsletterRecipient.lastName = employee.lastName
      }

      const user = await this.getManager.findOneBy(UserEntity, { email })
      if (user) {
        newsletterRecipient.firstName = user.firstName
        newsletterRecipient.lastName = user.lastName
        newsletterRecipient.companyName = user.companyName
      }

      const recipient = this.repository.create(newsletterRecipient)
      await this.repository.save(recipient)
      return res.status(200).json(recipient)
    })
  }

  public getAllPaginate = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const queriesFilters = paginator(req, newsletterRecipientSearchableFields)

      const [newsletterRecipients, total] = await this.repository.findAndCount({
        ...queriesFilters,
        where: {
          ...queriesFilters.where as FindOptionsWhere<NewsletterRecipient>,
        },
      })

      return res.status(200).json({
        data: newsletterRecipients,
        currentPage: queriesFilters.page,
        limit: queriesFilters.take,
        total,
      })
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const recipient = await this.repository.findOne({ where: { id } })
      if (recipient) {
        await this.repository.delete(id)
        return res.status(204).json({ data: recipient, message: 'event deleted' })
      }
      return res.status(401).json('Not allowed')
    })
  }
}
