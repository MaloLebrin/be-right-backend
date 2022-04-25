import { NewsletterRecipient, newsletterRecipientSearchableFields } from './../entity/NewsletterRecipientEntity';
import { Request, Response } from "express"
import { getManager } from "typeorm"
import { paginator } from "../utils"

export default class NewsletterController {

  public static createOne = async (req: Request, res: Response) => {
    try {
      const { email, firstName, lastName, companyName }: { email: string, firstName: string, lastName: string, companyName: string } = req.body
      const newsletterRecipient = {
        email,
        firstName: firstName ? firstName : null,
        lastName: lastName ? lastName : null,
        companyName: companyName ? companyName : null,
      }
      const recipientAlreadyExist = await getManager().findOne(NewsletterRecipient, { email })
      if (recipientAlreadyExist) {
        return res.status(422).json({ error: 'cet email existe déjà' })
      }
      const recipient = getManager().create(NewsletterRecipient, newsletterRecipient)
      await getManager().save(recipient)
      return res.status(200).json(recipient)
    } catch (error) {
      return res.status(error.status).json({ error: error.message })
    }
  }

  public static getAllPaginate = async (req: Request, res: Response) => {
    try {
      const queriesFilters = paginator(req, newsletterRecipientSearchableFields)
      const newsletterRecipients = await getManager().find(NewsletterRecipient, queriesFilters)
      const total = await getManager().count(NewsletterRecipient, queriesFilters)
      return res.status(200).json({
        data: newsletterRecipients,
        currentPage: queriesFilters.page,
        limit: queriesFilters.take,
        total,
      })
    } catch (error) {
      return res.status(error.status).json({ error: error.message })
    }
  }

  public static deleteOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      const recipient = await getManager().findOne(NewsletterRecipient, id)
      if (recipient) {
        await getManager().delete(NewsletterRecipient, id)
        return res.status(204).json({ data: recipient, message: 'event deleted' })
      } else {
        return res.status(401).json('Not allowed')
      }
    } catch (error) {
      return res.status(error.status).json({ error: error.message })
    }
  }
}
