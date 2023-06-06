import type { Request, Response } from 'express'
import type { DataSource, EntityManager, Repository } from 'typeorm'
import { wrapperRequest } from '../utils'
import { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import { UserEntity } from '../entity/UserEntity'
import { ApiError } from '../middlewares/ApiError'
import { NewsletterRecipient } from './../entity/NewsletterRecipientEntity'

export class NewsletterController {
  getManager: EntityManager
  repository: Repository<NewsletterRecipient>
  UserRepository: Repository<UserEntity>

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.getManager = DATA_SOURCE.manager
      this.repository = DATA_SOURCE.getRepository(NewsletterRecipient)
      this.UserRepository = DATA_SOURCE.getRepository(UserEntity)
    }
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
        newsletterRecipient.firstName = user.firstName
        newsletterRecipient.lastName = user.lastName
        newsletterRecipient.companyName = user.company.name
      }

      const recipient = this.repository.create(newsletterRecipient)
      await this.repository.save(recipient)
      return res.status(200).json(recipient)
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
