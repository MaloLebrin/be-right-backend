import type { DataSource } from 'typeorm'
import dayjs from 'dayjs'
import UserService from '../../services/UserService'
import { AddressService } from '../../services/AddressService'
import EmployeeService from '../../services/EmployeeService'
import EventService from '../../services/EventService'
import AnswerService from '../../services/AnswerService'
import type EventEntity from '../../entity/EventEntity'
import { SubscriptionEnum } from '../../types'
import AnswerEntity from '../../entity/AnswerEntity'
// import { SubscriptionService } from '../../services'
import { SubscriptionEntitiy } from '../../entity'
import {
  addressFixtureCompanyMedium,
  addressFixtureCompanyPremium,
  employeesFixtureCompanyMedium,
  employeesFixtureCompanyPremium,
  eventFixtureCompanyMedium,
  eventFixtureCompanyPremium,
  userCompanyFixtureMedium,
  userCompanyFixturePremium,
} from './fixtures'

export async function seedUserCompany(APP_SOURCE_SEEDER: DataSource) {
  const getManager = APP_SOURCE_SEEDER.manager

  const user = await UserService.createOneUser(userCompanyFixturePremium)

  // await SubscriptionService.createOne(SubscriptionEnum.PREMIUM, user.id)

  const subscription = getManager.create(SubscriptionEntitiy, {
    type: SubscriptionEnum.PREMIUM,
    user: user.id,
    expireAt: dayjs().add(1, 'year'),
  })
  await getManager.save(subscription)

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
  const answer = await AnswerService.getOneAnswerForEventEmployee(event.id, employeeIds[0])
  if (answer) {
    answer.hasSigned = true
    answer.signedAt = new Date()
    await getManager.save(AnswerEntity, answer)
  }
}

export async function seedMediumUserData(APP_SOURCE_SEEDER: DataSource) {
  const getManager = APP_SOURCE_SEEDER.manager

  const user = await UserService.createOneUser(userCompanyFixtureMedium)

  const subscription = getManager.create(SubscriptionEntitiy, {
    type: SubscriptionEnum.MEDIUM,
    user: user.id,
    expireAt: dayjs().add(1, 'year'),
  })
  await getManager.save(subscription)

  await AddressService.createOne({
    address: addressFixtureCompanyMedium,
    userId: user.id,
  })

  const employees = await Promise.all(employeesFixtureCompanyMedium.map(
    async item => await EmployeeService.createOne(item.employee, user.id),
  ))

  const employeeIds = employees.map(employee => employee.id)

  const event = await EventService.createOneEvent(
    {
      ...eventFixtureCompanyMedium.event,
      employeeIds,
      createdByUser: user.id,
    } as unknown as Partial<EventEntity>,
    user.id,
    1,
  )

  await AddressService.createOne({
    address: eventFixtureCompanyMedium.address,
    eventId: event.id,
  })

  await AnswerService.createMany(event.id, employeeIds)
  const answer = await AnswerService.getOneAnswerForEventEmployee(event.id, employeeIds[0])
  if (answer) {
    answer.hasSigned = true
    answer.signedAt = new Date()
    await getManager.save(AnswerEntity, answer)
  }
}
