import type { Request, Response } from 'express'
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

  private async toJson(obj: any) {
    return await JSON.stringify(obj)
  }

  public downLoadAnswer = async (req: Request, res: Response) => {
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
}
