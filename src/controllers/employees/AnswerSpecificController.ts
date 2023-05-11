import type { Request, Response } from 'express'
import type { Repository } from 'typeorm'
import { IsNull } from 'typeorm'
import { verify } from 'jsonwebtoken'
import puppeteer from 'puppeteer'
import { wrapperRequest } from '../../utils'
import { APP_SOURCE } from '../..'
import AnswerService from '../../services/AnswerService'
import AnswerEntity from '../../entity/AnswerEntity'
import { useEnv } from '../../env'
import { ApiError } from '../../middlewares/ApiError'
import type { DecodedJWTToken } from '../../types'
import { EmployeeEntity } from '../../entity/employees/EmployeeEntity'
import { answerResponse } from '../../utils/answerHelper'
import EventEntity from '../../entity/EventEntity'
import { defaultQueue } from '../../jobs/queue/queue'
import { UpdateEventStatusJob } from '../../jobs/queue/jobs/updateEventStatus.job'
import { MailjetService } from '../../services'

export class AnswerSpecificController {
  AnswerService: AnswerService
  EventRepository: Repository<EventEntity>
  AnswerRepository: Repository<AnswerEntity>
  EmployeeRepository: Repository<EmployeeEntity>
  MailJetService: MailjetService

  constructor() {
    this.EmployeeRepository = APP_SOURCE.getRepository(EmployeeEntity)
    this.EventRepository = APP_SOURCE.getRepository(EventEntity)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AnswerRepository = APP_SOURCE.getRepository(AnswerEntity)
    this.MailJetService = new MailjetService(APP_SOURCE)
  }

  private async isValidToken(token: string, email: string) {
    const { JWT_SECRET } = useEnv()

    const decodedToken = verify(token, JWT_SECRET) as DecodedJWTToken | string

    if (decodedToken && typeof decodedToken !== 'string') {
      if (email !== decodedToken.email) {
        throw new ApiError(401, 'Action non autorisée')
      }
      return decodedToken
    }
    return false
  }

  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { token, email }: { token: string; email: string } = req.body

      if (!token || !email) {
        throw new ApiError(422, 'identifiant du destinataire manquant')
      }

      await this.isValidToken(token, email)

      const answer = await this.AnswerRepository.findOne({
        where: {
          token,
        },
        relations: [
          'employee.address',
          'event.address',
          'event.company.address',
          'event.company.users',
          'event.partner',
        ],
      })

      if (!answer) {
        throw new ApiError(422, 'Élément introuvable')
      }

      if (answer.signedAt) {
        throw new ApiError(422, 'Vous avez déjà donné une réponse')
      }

      const event = answer.event

      const employee = answer.employee

      if (!event || !employee) {
        throw new ApiError(
          422,
          `${!event ? 'Événement' : ''} ${(!event && !employee) ? 'et' : ''} ${!employee ? 'Destinataire' : ''} introuvable `)
      }

      return res.status(200).json({
        answer: answerResponse(answer),
        event,
        employee,
      })
    })
  }

  public checkTwoAuth = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { token, email, twoFactorCode }: { token: string; email: string; twoFactorCode: string } = req.body

      if (!token || !email || !twoFactorCode) {
        throw new ApiError(422, 'Paramètres manquants')
      }

      await this.isValidToken(token, email)

      const isExist = await this.AnswerRepository.exist({
        where: {
          token,
          twoFactorCode,
          employee: {
            email,
          },
          signedAt: IsNull(),
        },
      })

      if (!isExist) {
        throw new ApiError(422, 'Élément introuvable ou vous avez déjà répondu')
      }

      return res.status(200).json({
        message: 'Code approuvé',
        status: 200,
      })
    })
  }

  public updateAnswerByEmployee = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const answerId = parseInt(req.params.id)
      const {
        token,
        email,
        hasSigned,
        reason,
      }: {
        token: string
        email: string
        reason?: string
        hasSigned: boolean
      } = req.body

      if (!token || !email || !answerId) {
        throw new ApiError(422, 'Paramètres manquants')
      }

      await this.isValidToken(token, email)

      const answer = await this.AnswerRepository.findOne({
        where: {
          token,
          id: answerId,
          employee: {
            email,
          },
          signedAt: IsNull(),
        },
        relations: {
          employee: true,
        },
      })

      if (!answer) {
        throw new ApiError(422, 'Élément introuvable ou vous avez déjà répondu')
      }

      await this.AnswerRepository.update(answerId, {
        signedAt: new Date(),
        hasSigned,
        reason: reason || null,
      })

      await defaultQueue.add(Date.now().toString(), new UpdateEventStatusJob({
        eventId: answer.eventId,
      }))

      const baseUrl = `${req.protocol}://${req.get('host')}`
      const url = `${baseUrl}/answer/view/?ids=${req.query.ids}`
      const fileName = `droit-image-${answer.employee.slug}.pdf`
      const filePath = `/app/src/uploads/${fileName}`

      const browser = await puppeteer.launch({
        headless: true,
        executablePath: '/usr/bin/chromium-browser',
        args: [
          '--no-sandbox',
          '--disable-gpu',
        ],
      })

      const page = await browser.newPage()

      await page.goto(url)
      const pdf = await page.pdf({ path: filePath, format: 'a4', printBackground: true })
      await browser.close()

      await this.MailJetService.sendEmployeeAnswerWithPDF({
        creatorFullName: 'Test',
        employee: answer.employee,
        companyName: 'Test',
        pdfBase64: pdf.toString('base64'),
        fileName,
      })

      return res.status(200).json(answer)
    })
  }
}
