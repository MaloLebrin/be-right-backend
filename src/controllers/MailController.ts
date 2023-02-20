import type { Request, Response } from 'express'
import type { Logger } from 'pino'
import { logger } from '../middlewares/loggerService'
import { MailjetService } from '../services'
import { wrapperRequest } from '../utils'
import { APP_SOURCE } from '..'
import { ApiError } from '../middlewares/ApiError'
import AnswerService from '../services/AnswerService'
import type { EmployeeEntity } from '../entity/EmployeeEntity'
import { firtSendAnswerTemplate } from '../utils/mailJetHelpers'
import Context from '../context'
import { isUserAdmin } from '../utils/userHelper'

export class MailController {
  logger: Logger<{
    transport: {
      target: string
      options: {
        colorize: boolean
      }
    }
  }>

  MailjetService: MailjetService
  AnswerService: AnswerService

  constructor() {
    this.MailjetService = new MailjetService(APP_SOURCE)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.logger = logger
  }

  public sendMailToEmployee = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const answerId = parseInt(req.params.id)
      const ctx = Context.get(req)
      if (answerId) {
        const answer = await this.AnswerService.getOne(answerId, true)

        const event = answer.event
        const currentUser = ctx.user

        if (event && (event.createdByUserId !== currentUser.id && !isUserAdmin(currentUser))) {
          throw new ApiError(401, 'Vous n\'êtes pas autorizé à effectuer cette action')
        }

        if (!answer) {
          throw new ApiError(422, 'Réponse à l\'événement manquante')
        }

        const employee = answer.employee as EmployeeEntity

        if (employee) {
          const { status, message, body } = await this.MailjetService.sendEmployeeMail({ answer, employee, template: firtSendAnswerTemplate({ employee, creator: ctx.user }) })
          return res.status(200).json({ status, message, body })
        }
      }
      throw new ApiError(422, 'Identifiant manquant')
    })
  }
}
