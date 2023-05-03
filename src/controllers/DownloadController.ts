import { unlink } from 'node:fs'
import type { Request, Response } from 'express'
import puppeteer from 'puppeteer'
import type { Logger } from 'pino'
import type { Repository } from 'typeorm'
import { In } from 'typeorm'
import { APP_SOURCE } from '..'
import { ApiError } from '../middlewares/ApiError'
import AnswerService from '../services/AnswerService'
import EventService from '../services/EventService'
import { hasOwnProperty } from '../utils/objectHelper'
import { wrapperRequest } from '../utils'
import { parseQueryIds } from '../utils/basicHelper'
import UserService from '../services/UserService'
import { AddressService } from '../services'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'
import { logger } from '../middlewares/loggerService'
import { CompanyService } from '../services/CompanyService'
import { isUserOwner } from '../utils/userHelper'
import AnswerEntity from '../entity/AnswerEntity'

export default class AuthController {
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

  constructor() {
    this.repository = APP_SOURCE.getRepository(AnswerEntity)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AddressService = new AddressService(APP_SOURCE)
    this.UserService = new UserService(APP_SOURCE)
    this.EventService = new EventService(APP_SOURCE)
    this.CompanyService = new CompanyService(APP_SOURCE)
    this.logger = logger
  }

  // eslint-disable-next-line promise/param-names
  private delay = async (ms: number) => new Promise(res => setTimeout(res, ms))

  public ViewAnswer = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      if (id) {
        const answer = await this.repository.findOne({
          where: {
            id,
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

        if (answer && hasOwnProperty(answer, 'event') && hasOwnProperty(answer, 'employee')) {
          const event = answer.event
          const employee = answer.employee as EmployeeEntity

          const partner = event.partner
          const company = event.company
          const employeeAddress = answer.employee.address
          const user = company.users.find(user => isUserOwner(user))

          return res.render('answer', {
            todayDate: new Date().toISOString(),
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
            userFirstName: user?.firstName,
            userLastName: user?.lastName,
          })
        }
      }
      throw new ApiError(422, 'L\'identifiant de la réponse est requis').Handler(res)
    })
  }

  public downLoadAnswer = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      if (!id) {
        throw new ApiError(422, 'L\'identifiant de la réponse est requis')
      }

      const answer = await this.AnswerService.getOne(id, true)

      const employee = answer?.employee as EmployeeEntity
      if (employee) {
        const baseUrl = `${req.protocol}://${req.get('host')}`
        const url = `${baseUrl}/answer/view/${id}`

        const filePath = `/app/uploads/droit-image-${employee.slug}.pdf`

        try {
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

          return res
            .set({ 'Content-Type': 'application/pdf', 'Content-Length': pdf.length })
            .download(filePath)
        } catch (error) {
          this.logger.error(error)
          return res.status(error.status || 500).send({
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
      }
    })
  }

  public downLoadAnswers = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const answerIds = parseQueryIds(req.query.ids as string)

      if (!answerIds || answerIds.length < 1) {
        throw new ApiError(422, 'L\'identifiant de la réponse est requis')
      }

      const answers = await this.repository.find({
        where: {
          id: In(answerIds),
        },
        relations: {
          employee: true,
        },
      })
      return answers
    })
  }
}
