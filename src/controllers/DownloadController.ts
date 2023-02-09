import path from 'path'
import type { Request, Response } from 'express'
import puppeteer from 'puppeteer'
import { APP_SOURCE } from '..'
import { ApiError } from '../middlewares/ApiError'
// import type RedisCache from '../RedisCache'
import AnswerService from '../services/AnswerService'
import EventService from '../services/EventService'
import { hasOwnProperty } from '../utils/objectHelper'
import { wrapperRequest } from '../utils'
import UserService from '../services/UserService'
import { AddressService } from '../services'
import type { EmployeeEntity } from '../entity/EmployeeEntity'

export default class AuthController {
  AnswerService: AnswerService
  AddressService: AddressService
  EventService: EventService
  UserService: UserService
  // redisCache: RedisCache

  constructor() {
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AddressService = new AddressService(APP_SOURCE)
    this.UserService = new UserService(APP_SOURCE)
    this.EventService = new EventService(APP_SOURCE)
    // this.redisCache = REDIS_CACHE
  }

  public ViewAnswer = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      if (id) {
        const answer = await this.AnswerService.getOne(id, true)

        if (answer && hasOwnProperty(answer, 'event') && hasOwnProperty(answer, 'employee')) {
          const event = answer.event
          const employee = answer.employee as EmployeeEntity

          const partner = await this.UserService.getOne(event.partnerId)
          const user = await this.UserService.getOneWithRelations(event.createdByUserId)
          const userAddress = user.address
          const employeeAddress = await this.AddressService.getOne(employee.addressId)

          return res.render('answer', {
            todayDate: new Date().toISOString(),
            companyName: user.companyName,

            employeeFirstName: employee.firstName,
            employeeLastName: employee.lastName,
            employeeStreet: employeeAddress.addressLine,
            employeePostalCode: employeeAddress.postalCode,
            employeeCity: employeeAddress.city,
            employeeCountry: employeeAddress.country,

            partnerFirstName: partner.firstName,
            partnerLastName: partner.lastName,

            userCity: userAddress.city,
            userFirstName: user.firstName,
            userLastName: user.lastName,
          })
        }
      }
      throw new ApiError(422, 'L\'identifiant de la réponse est requis').Handler(res)
    })
  }

  public downLoadAnswer = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      if (id) {
        const answer = await this.AnswerService.getOne(id, true)

        const employee = answer?.employee as EmployeeEntity
        if (employee) {
          const baseUrl = `${req.protocol}://${req.get('host')}`
          const url = `${baseUrl}answer/download/1`
          // const url = `${baseUrl}/orders/${id}/view`

          const filePath = path.resolve(__dirname, `../../public/ANSWER-${employee.slug}.pdf`)

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
          await page.pdf({ path: filePath, format: 'a4', printBackground: true })
          await browser.close()

          return res.download(filePath)
        }
      }
      // throw new ApiError(422, 'L\'identifiant de la réponse est requis').Handler(res)
    })
  }
}
