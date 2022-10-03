import type { Request, Response } from 'express'
import { getManager } from 'typeorm'
import { paginator, wrapperRequest } from '../utils'
import { EmployeeEntity, UserEntity } from '../entity'
import { NewsletterRecipient, newsletterRecipientSearchableFields } from './../entity/NewsletterRecipientEntity'

export default class NewsletterController {
  public static createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email, firstName, lastName, companyName }: { email: string; firstName: string; lastName: string; companyName: string } = req.body
      const newsletterRecipient = {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
        companyName: companyName || null,
      }
      const recipientAlreadyExist = await getManager().findOne(NewsletterRecipient, { email })
      if (recipientAlreadyExist) {
        return res.status(422).json({ error: 'cet email existe déjà' })
      }
      const employee = await getManager().findOne(EmployeeEntity, { email })
      if (employee) {
        newsletterRecipient.firstName = employee.firstName
        newsletterRecipient.lastName = employee.lastName
      }
      const user = await getManager().findOne(UserEntity, { email })
      if (user) {
        newsletterRecipient.firstName = user.firstName
        newsletterRecipient.lastName = user.lastName
        newsletterRecipient.companyName = user.companyName
      }

      const recipient = getManager().create(NewsletterRecipient, newsletterRecipient)
      await getManager().save(recipient)
      return res.status(200).json(recipient)
    })
  }

  public static getAllPaginate = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const queriesFilters = paginator(req, newsletterRecipientSearchableFields)
      const newsletterRecipients = await getManager().find(NewsletterRecipient, queriesFilters)
      const total = await getManager().count(NewsletterRecipient, queriesFilters)
      return res.status(200).json({
        data: newsletterRecipients,
        currentPage: queriesFilters.page,
        limit: queriesFilters.take,
        total,
      })
    })
  }

  public static deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const recipient = await getManager().findOne(NewsletterRecipient, id)
      if (recipient) {
        await getManager().delete(NewsletterRecipient, id)
        return res.status(204).json({ data: recipient, message: 'event deleted' })
      }
      return res.status(401).json('Not allowed')
    })
  }
}
