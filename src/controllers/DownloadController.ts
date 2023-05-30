import { unlink } from 'node:fs'
import type { Request, Response } from 'express'
import puppeteer from 'puppeteer'
import type { Logger } from 'pino'
import type { DataSource, Repository } from 'typeorm'
import { In, IsNull, Not } from 'typeorm'
import { ApiError } from '../middlewares/ApiError'
import AnswerService from '../services/AnswerService'
import EventService from '../services/EventService'
import { hasOwnProperty } from '../utils/objectHelper'
import { wrapperRequest } from '../utils'
import { getCookie, parseQueryIds } from '../utils/basicHelper'
import UserService from '../services/UserService'
import { AddressService } from '../services'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import { logger } from '../middlewares/loggerService'
import { CompanyService } from '../services/CompanyService'
import { isUserOwner } from '../utils/userHelper'
import AnswerEntity from '../entity/AnswerEntity'
import Context from '../context'

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

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.repository = DATA_SOURCE.getRepository(AnswerEntity)
      this.AnswerService = new AnswerService(DATA_SOURCE)
      this.AddressService = new AddressService(DATA_SOURCE)
      this.UserService = new UserService(DATA_SOURCE)
      this.EventService = new EventService(DATA_SOURCE)
      this.CompanyService = new CompanyService(DATA_SOURCE)
      this.logger = logger
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

  public ViewAnswer = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)
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
        relations: [
          'event.company',
          'event.company.address',
          'event.company.users',
          'event.partner',
          'employee',
          'employee.address',
        ],
      })

      if (!answers && answers.length < 1) {
        throw new ApiError(422, 'le destinataire n\'a pas répondu')
      }

      if (answers.every(answer => hasOwnProperty(answer, 'event') && hasOwnProperty(answer, 'employee'))) {
        return res.render('answer', {
          data: this.mapAnswersToDownload(answers),
        })
      }
    })
  }

  public downLoadAnswer = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)

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
        },
      })

      if (answers.length < 1) {
        throw new ApiError(422, 'Aucun destinataire n\'a pas répondu')
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`
      const url = `${baseUrl}/answer/view/?ids=${req.query.ids}`

      let filePath = `/app/src/uploads/droit-image-${answers[0].employee.slug}.pdf`

      if (answers.length > 1) {
        const event = await this.EventService.getOneWithoutRelations(answers[0].eventId)
        filePath = `/app/src/uploads/droit-image-${event.name}.pdf`
      }

      try {
        const browser = await puppeteer.launch({
          headless: 'new',
          executablePath: '/usr/bin/chromium-browser',
          args: [
            '--no-sandbox',
            '--disable-gpu',
          ],
        })

        const page = await browser.newPage()

        const cookie = getCookie(req, 'userToken')
        if (cookie) {
          await page.setExtraHTTPHeaders({
            authorization: `Bearer ${cookie}`,
          })
        }

        await page.goto(url, { waitUntil: 'networkidle0' })
        const pdf = await page.pdf({ path: filePath, format: 'a4', printBackground: true })
        await browser.close()

        return res
          .set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
          .download(filePath)
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
