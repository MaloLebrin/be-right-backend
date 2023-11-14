import type { NextFunction, Request, Response } from 'express'
import type { DataSource, Repository } from 'typeorm'
import { IsNull } from 'typeorm'
import { verify } from 'jsonwebtoken'
import { wrapperRequest } from '../../utils'
import AnswerService from '../../services/AnswerService'
import AnswerEntity from '../../entity/AnswerEntity'
import { useEnv } from '../../env'
import { ApiError } from '../../middlewares/ApiError'
import type { DecodedJWTToken } from '../../types'
import { EmployeeEntity } from '../../entity/employees/EmployeeEntity'
import { answerResponse } from '../../utils/answerHelper'
import EventEntity from '../../entity/EventEntity'
// import { defaultQueue } from '../../jobs/queue/queue'
// import { UpdateEventStatusJob } from '../../jobs/queue/jobs/updateEventStatus.job'
// import { generateQueueName } from '../../jobs/queue/jobs/provider'
// import { SendSubmitAnswerConfirmationJob } from '../../jobs/queue/jobs/sendSubmitAnswerConfirmation.job'
import { getfullUsername, isUserOwner } from '../../utils/userHelper'
import { MailjetService } from '../../services'
import { launchPuppeteer } from '../../utils/puppeteerHelper'

export class AnswerSpecificController {
  AnswerService: AnswerService
  EventRepository: Repository<EventEntity>
  AnswerRepository: Repository<AnswerEntity>
  EmployeeRepository: Repository<EmployeeEntity>
  MailJetService: MailjetService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.EmployeeRepository = DATA_SOURCE.getRepository(EmployeeEntity)
      this.EventRepository = DATA_SOURCE.getRepository(EventEntity)
      this.AnswerService = new AnswerService(DATA_SOURCE)
      this.AnswerRepository = DATA_SOURCE.getRepository(AnswerEntity)
      this.MailJetService = new MailjetService(DATA_SOURCE)
    }
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

  public getOneAndSendCode = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
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

      const answerWithToken = await this.AnswerRepository.findOne({
        where: {
          token,
        },
        select: {
          id: true,
          token: true,
          twoFactorCode: true,
        },
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

      await this.MailJetService.sendTwoFactorAuth({
        twoFactorCode: answerWithToken.twoFactorCode,
        employee: answer.employee,
        creator: answer.event.company.users.find(user => isUserOwner(user)),
        eventName: answer.event.name,
      })

      return res.status(200).json({
        answer: answerResponse(answer),
        event,
        employee,
      })
    })
  }

  public checkTwoAuth = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
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

  public updateAnswerByEmployee = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const answerId = parseInt(req.params.id)
      const {
        token,
        email,
        hasSigned,
        signature,
        reason,
        isSavedSignatureForNextTime,
      }: {
        token: string
        email: string
        signature: string
        reason?: string
        hasSigned: boolean
        isSavedSignatureForNextTime?: boolean
      } = req.body

      if (!token || !email || !answerId) {
        throw new ApiError(422, 'Paramètres manquants')
      }

      await this.isValidToken(token, email)

      const isAnswerExist = await this.AnswerRepository.exist({
        where: {
          token,
          id: answerId,
          employee: {
            email,
          },
          signedAt: IsNull(),
        },
      })

      if (!isAnswerExist) {
        throw new ApiError(422, 'Élément introuvable ou vous avez déjà répondu')
      }

      await this.AnswerRepository.update(answerId, {
        signedAt: new Date(),
        hasSigned,
        signature,
        reason: reason || null,
      })

      const answer = await this.AnswerRepository.findOne({
        where: {
          token,
          id: answerId,
          employee: {
            email,
          },
        },
        relations: ['employee', 'event.company.users'],
      })

      if (!answer) {
        throw new ApiError(422, 'Une erreur est survenue')
      }

      const creator = answer?.event?.company?.users.find(user => isUserOwner(user))

      if (!creator || !answer.event.company) {
        throw new ApiError(422, 'Créateur introuvable')
      }

      // await defaultQueue.add(
      //   generateQueueName('SendSubmitAnswerConfirmationJob'),
      //   new SendSubmitAnswerConfirmationJob({
      //     req,
      //     answer,
      //     creatorFullName: getfullUsername(creator),
      //     companyName: answer.event.company.name,
      //   }),
      // )

      // await defaultQueue.add(generateQueueName('UpdateEventStatusJob'), new UpdateEventStatusJob({
      //   eventId: answer.eventId,
      // }))

      const baseUrl = `${req.protocol}://${req.get('host')}`
      const url = `${baseUrl}/answer/view/?ids=${req.query.ids}`
      const fileName = `droit-image-${answer.employee.slug}.pdf`
      const filePath = `/app/src/uploads/${fileName}`

      const browser = await launchPuppeteer()

      const page = await browser.newPage()

      await page.goto(url)
      const pdf = await page.pdf({ path: filePath, format: 'a4', printBackground: true })
      await browser.close()

      await this.MailJetService.sendEmployeeAnswerWithPDF({
        creatorFullName: getfullUsername(creator),
        employee: answer.employee,
        companyName: answer.event.company.name,
        pdfBase64: pdf.toString('base64'),
        fileName,
      })

      const employee = answer.employee

      if (isSavedSignatureForNextTime) {
        if (!employee.signature || employee.signature !== signature) {
          await this.EmployeeRepository.update(answer.employeeId, {
            signature,
          })
        }
      }

      return res.status(200).json(answer)
    })
  }
}
