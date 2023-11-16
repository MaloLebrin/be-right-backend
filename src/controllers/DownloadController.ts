import { unlink } from 'node:fs'
import type { NextFunction, Request, Response } from 'express'
import type { Logger } from 'pino'
import type { DataSource, QueryRunner, Repository } from 'typeorm'
import { In, IsNull, Not } from 'typeorm'
import { ApiError } from '../middlewares/ApiError'
import AnswerService from '../services/AnswerService'
import EventService from '../services/EventService'
import { wrapperRequest } from '../utils'
import { parseQueryIds } from '../utils/basicHelper'
import UserService from '../services/UserService'
import { AddressService } from '../services'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import { logger } from '../middlewares/loggerService'
import { CompanyService } from '../services/CompanyService'
import { isUserOwner } from '../utils/userHelper'
import AnswerEntity from '../entity/AnswerEntity'
import { generateAnswerPdf } from '../utils/puppeteerHelper'

export class DownloadController {
  AnswerService: AnswerService
  repository: Repository<AnswerEntity>
  AddressService: AddressService
  EventService: EventService
  UserService: UserService
  CompanyService: CompanyService
  logger: Logger<{
    transport: {
      target: string
      options: {
        colorize: boolean
      }
    }
  }>

  queryRunner: QueryRunner

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.repository = DATA_SOURCE.getRepository(AnswerEntity)
      this.AnswerService = new AnswerService(DATA_SOURCE)
      this.AddressService = new AddressService(DATA_SOURCE)
      this.UserService = new UserService(DATA_SOURCE)
      this.EventService = new EventService(DATA_SOURCE)
      this.CompanyService = new CompanyService(DATA_SOURCE)
      this.logger = logger
      this.queryRunner = DATA_SOURCE.createQueryRunner()
    }
  }

  private mapAnswersToDownload = (answers: AnswerEntity[]) => {
    return answers.map(answer => {
      const event = answer.event
      const employee = answer.employee as EmployeeEntity

      const partner = event.partner
      const company = event.company
      const employeeAddress = answer.employee.address
      const owner = company.users.find(user => isUserOwner(user))

      return {
        todayDate: answer.signedAt.toISOString(),
        companyName: company.name,

        employeeFirstName: employee.firstName,
        employeeLastName: employee.lastName,
        employeeStreet: employeeAddress.addressLine,
        employeePostalCode: employeeAddress.postalCode,
        employeeCity: employeeAddress.city,
        employeeCountry: employeeAddress.country,

        partnerFirstName: partner.firstName,
        partnerLastName: partner.lastName,

        userCity: company.address?.city,
        userFirstName: owner?.firstName,
        userLastName: owner?.lastName,
        isAccepted: answer.hasSigned,

        recipientSignature: answer.signature,
        ownerSignature: owner?.signature,
      }
    })
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

  public downLoadAnswer = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      console.time('downLoadAnswer')

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

      const { content, filePath } = await generateAnswerPdf({
        url,
        fileName,
        token: currentUser.token,
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
        await this.delay(1000)
        console.timeEnd('downLoadAnswer')

        // eslint-disable-next-line security/detect-non-literal-fs-filename
        unlink(filePath, err => {
          if (err) {
            this.logger.error(err)
            return res.status(422).send({
              success: false,
              message: err.message,
              stack: err.stack,
              description: err.cause,
            })
          } else {
            this.logger.info(`${filePath} was deleted`)
          }
        })
      }
    })
  }
}
