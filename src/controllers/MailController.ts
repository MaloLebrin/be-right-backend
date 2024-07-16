import type { NextFunction, Request, Response } from 'express'

import { logger } from '../middlewares/loggerService'
import { MailjetService } from '../services'
import { wrapperRequest } from '../utils'
import { APP_SOURCE } from '..'
import { ApiError } from '../middlewares/ApiError'
import AnswerService from '../services/AnswerService'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import { isUserAdmin } from '../utils/userHelper'

export class MailController {
  private logger: typeof logger
  private MailjetService: MailjetService
  private AnswerService: AnswerService

  constructor() {
    this.MailjetService = new MailjetService(APP_SOURCE)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.logger = logger
  }

  public sendMailToEmployee = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const answerId = parseInt(req.params.id)
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (answerId) {
        const answer = await this.AnswerService.getOne(answerId, true)

        const event = answer.event
        const currentUser = ctx.user

        if (event && (event.companyId !== currentUser.companyId && !isUserAdmin(currentUser))) {
          throw new ApiError(401, 'Vous n\'êtes pas autorizé à effectuer cette action')
        }

        if (!answer) {
          throw new ApiError(422, 'Réponse à l\'événement manquante')
        }

        const employee = answer.employee as EmployeeEntity

        if (employee) {
          const { status, message, body } = await this.MailjetService.sendEmployeeMail({ answer, employee, event, creator: currentUser })
          return res.status(200).json({ status, message, body })
        }
      }
      throw new ApiError(422, 'Identifiant manquant')
    })
  }
}
