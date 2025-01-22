import type { NextFunction, Request, Response } from 'express'
import type { DataSource, QueryRunner, Repository } from 'typeorm'
import { In, IsNull, Not } from 'typeorm'
import { noNull } from '@antfu/utils'
import { ApiError } from '../middlewares/ApiError'
import { wrapperRequest } from '../utils'
import { parseQueryIds } from '../utils/basicHelper'
import { logger } from '../middlewares/loggerService'
import AnswerEntity from '../entity/AnswerEntity'
import { generatePdfFromUrl } from '../utils/puppeteerHelper'
import { isProduction } from '../utils/envHelper'
import { EventService } from '../services/event/EventService'

export class DownloadController {
  private repository: Repository<AnswerEntity>
  private queryRunner: QueryRunner
  private logger: typeof logger
  private EventService: EventService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.repository = DATA_SOURCE.getRepository(AnswerEntity)
      this.logger = logger
      this.queryRunner = DATA_SOURCE.createQueryRunner()
      this.EventService = new EventService(DATA_SOURCE)
    }
  }

  // eslint-disable-next-line promise/param-names
  private delay = async (ms: number) => new Promise(res => setTimeout(res, ms))

  public ViewAnswer = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      console.time('ViewAnswer')
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const currentUser = ctx.user

      if (!currentUser?.companyId) {
        throw new ApiError(401, 'Action non authorisée')
      }

      const answerIds = parseQueryIds(req.query.ids as string)

      if (!answerIds || answerIds.length < 1) {
        throw new ApiError(422, 'L\'identifiant de la réponse est requis')
      }

      const answers = await this.queryRunner.query(`
      SELECT
        answer_entity."id" as "answerId",
        answer_entity."signedAt",
        answer_entity."hasSigned" as "isAccepted",
        answer_entity.signature as "recipientSignature",
    
        event_entity."name" as "eventName",
        
        employee_entity."firstName" as "employeeFirstName",
        employee_entity."lastName" as "employeeLastName",
        
        address_entity."addressLine" as "employeeStreet",
        address_entity."postalCode" as "employeePostalCode",
        address_entity.city as "employeeCity",
        address_entity.country as "employeeCountry",
        
        partner."firstName" as "partnerFirstName",
        partner."lastName" as "partnerLastName",
        
        company_entity."name" as "companyName",
        
        user_entity."firstName" as "userFirstName",
        user_entity."lastName" as "userLastName",
        user_entity.signature as "ownerSignature",
        
        "companyAddress".city as "userCity"
        
      FROM answer_entity
      JOIN event_entity ON answer_entity."eventId" = event_entity.id
      JOIN employee_entity ON answer_entity."employeeId" = employee_entity.id
      JOIN address_entity ON employee_entity."addressId" = address_entity.id
    
      JOIN user_entity as partner ON event_entity."partnerId" = partner.id
      JOIN company_entity ON event_entity."companyId" = company_entity.id
      JOIN user_entity ON company_entity."id" = user_entity."companyId"
      JOIN address_entity AS "companyAddress" ON company_entity."addressId" = "companyAddress".id
      WHERE
        answer_entity."signedAt" IS NOT NULL
        AND
        answer_entity."hasSigned" = TRUE
        AND
        answer_entity."id" IN(${answerIds})
        AND
        user_entity.roles = 'OWNER'
      `)

      if (!answers && answers.length < 1) {
        throw new ApiError(422, 'le destinataire n\'a pas répondu')
      }

      console.timeEnd('ViewAnswer')

      return res.render('answer', {
        data: answers.map(answer => ({
          ...answer,
          todayDate: answer.signedAt.toISOString(),
        })),
      })
    })
  }

  public ViewList = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      console.time('ViewList')
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const currentUser = ctx.user

      if (!currentUser?.companyId) {
        throw new ApiError(401, 'Action non authorisée')
      }

      const eventId = parseInt(req.params.id as string)

      if (!noNull(eventId) || isNaN(eventId)) {
        throw new ApiError(422, 'L\'identifiant de l\'événement est requis')
      }

      const [answers, event] = await Promise.all([
        this.repository.find({
          where: {
            signedAt: Not(IsNull()),
            hasSigned: true,
            event: {
              id: eventId,
              company: {
                id: currentUser.companyId,
              },
            },
          },
          relations: {
            employee: true,
          },
        }),
        this.EventService.getOneWithoutRelations(eventId),
      ])

      if (!event) {
        throw new ApiError(422, 'L\'événement n\'existe pas')
      }

      if (answers.length < 1) {
        throw new ApiError(422, 'Aucun destinataire n\'a pas répondu')
      }
      console.timeEnd('ViewList')

      return res.render('sucessList', {
        data: {
          eventId,
          eventName: event.name,
          eventStart: event.start.toISOString(),
          eventEnd: event.end.toISOString(),
          recipients: answers.map(answer => ({
            firstName: answer.employee.firstName,
            lastName: answer.employee.lastName,
            signedAt: answer.signedAt.toISOString(),
          })),
          todayDate: new Date().toISOString(),
        },
      })
    })
  }

  public downLoadAnswer = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      console.time('downLoadAnswer in')

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const currentUser = ctx.user

      if (!currentUser?.companyId) {
        throw new ApiError(401, 'Action non authorisée')
      }

      const answerIds = parseQueryIds(req.query.ids as string)

      if (!answerIds || answerIds.length < 1) {
        throw new ApiError(422, 'L\'identifiant de la réponse est requis')
      }

      const answers = await this.repository.find({
        where: {
          id: In(answerIds),
          signedAt: Not(IsNull()),
          hasSigned: true,
          event: {
            company: {
              id: currentUser?.companyId,
            },
          },
        },
        relations: {
          employee: true,
          event: true,
        },
      })

      if (answers.length < 1) {
        throw new ApiError(422, 'Aucun destinataire n\'a pas répondu')
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`
      const url = `${baseUrl}/answer/view/?ids=${req.query.ids}`

      let fileName = `droit-image-${answers[0].employee.slug}.pdf`

      if (answers.length > 1) {
        const event = answers[0].event
        fileName = `droits-images-${event.name}.pdf`
      }

      const { content } = await generatePdfFromUrl({
        url,
        fileName,
        token: currentUser.token,
        isMadeByBrowserless: isProduction(),
      })
      try {
        return res
          .status(200)
          .json({
            fileName,
            content,
            mimeType: 'application/pdf',
          })
      } catch (error) {
        this.logger.error(error)

        return res
          .status(error.status || 500)
          .send({
            success: false,
            message: error.message,
            stack: error.stack,
            description: error.cause,
          })
      } finally {
        console.timeEnd('downLoadAnswer in')
      }
    })
  }

  public downLoadListRecipientsWhoAccepted = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      console.time('downLoadListRecipientsWhoAccepted in')
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const currentUser = ctx.user

      if (!currentUser?.companyId) {
        throw new ApiError(401, 'Action non authorisée')
      }

      const eventId = parseInt(req.params.id as string)

      if (!noNull(eventId) || isNaN(eventId)) {
        throw new ApiError(422, 'L\'identifiant de l\'événement est requis')
      }

      const [nbAnswers, event] = await Promise.all([
        this.repository.count({
          where: {
            signedAt: Not(IsNull()),
            hasSigned: true,
            event: {
              id: eventId,
              company: {
                id: currentUser.companyId,
              },
            },
          },
        }),
        this.EventService.getOneWithoutRelations(eventId),
      ])

      if (!event) {
        throw new ApiError(422, 'L\'événement n\'existe pas')
      }

      if (nbAnswers < 1) {
        throw new ApiError(422, 'Aucun destinataire n\'a pas répondu')
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`

      const fileName = `liste-destinataires -${event.name.trim()}.pdf`

      const { content } = await generatePdfFromUrl({
        url: `${baseUrl}/event/listOfAccepted/${eventId}`,
        fileName,
        token: 'perijgh',
        isMadeByBrowserless: isProduction(),
      })
      try {
        return res
          .status(200)
          .json({
            fileName,
            content,
            mimeType: 'application/pdf',
          })
      } catch (error) {
        this.logger.error(error)

        return res
          .status(error.status || 500)
          .send({
            success: false,
            message: error.message,
            stack: error.stack,
            description: error.cause,
          })
      } finally {
        console.timeEnd('downLoadListRecipientsWhoAccepted in')
      }
    })
  }
}
