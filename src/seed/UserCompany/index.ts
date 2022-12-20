import UserService from '../../services/UserService'
import { AddressService } from '../../services/AddressService'
import EmployeeService from '../../services/EmployeeService'
import EventService from '../../services/EventService'
import AnswerService from '../../services/AnswerService'
import type EventEntity from '../../entity/EventEntity'
import {
  addressFixtureCompanyPremium,
  employeesFixtureCompanyPremium,
  eventFixtureCompanyPremium,
  userCompanyFixturePremium,
} from './fixtures'

export async function seedUserCompany() {
  const user = await UserService.createOneUser(userCompanyFixturePremium)

  await AddressService.createOne({
    address: addressFixtureCompanyPremium,
    userId: user.id,
  })

  const employees = await Promise.all(employeesFixtureCompanyPremium.map(
    async item => await EmployeeService.createOne(item.employee, user.id),
  ))

  const employeeIds = employees.map(employee => employee.id)

  const event = await EventService.createOneEvent(
    {
      ...eventFixtureCompanyPremium.event,
      employeeIds,
      createdByUser: user.id,
    } as unknown as Partial<EventEntity>,
    user.id,
    1,
  )

  await AddressService.createOne({
    address: eventFixtureCompanyPremium.address,
    eventId: event.id,
  })

  await AnswerService.createMany(event.id, employeeIds)
}
