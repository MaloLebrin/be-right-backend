import type { Request, Response } from 'express'
import type { Logger } from 'pino'
import { useLogger } from '../middlewares/loggerService'
import { MailjetService } from '../services'
import { wrapperRequest } from '../utils'

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

  constructor() {
    this.MailjetService = new MailjetService()
    this.logger = useLogger().logger
  }

  public sendMailToEmployee = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const test = await this.MailjetService.sendEmployeeMail()
      console.log(test, '<==== test')
      return res.status(200).json(test)
    })
  }
}
