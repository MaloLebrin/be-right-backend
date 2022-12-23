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
import { SubscriptionEntity } from '../../entity/SubscriptionEntity'
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
  const addressService = new AddressService(APP_SOURCE_SEEDER)
  const answerService = new AnswerService(APP_SOURCE_SEEDER)

  const subscription = getManager.create(SubscriptionEntity, {
    type: SubscriptionEnum.PREMIUM,
    expireAt: dayjs().add(1, 'year'),
  })
  await getManager.save(subscription)

  const user = await new UserService(APP_SOURCE_SEEDER).createOneUser({
    ...userCompanyFixturePremium,
    subscriptionId: subscription.id,
  })

  // await SubscriptionService.createOne(SubscriptionEnum.PREMIUM, user.id)

  await addressService.createOne({
    address: addressFixtureCompanyPremium,
    userId: user.id,
  })

  const employees = await Promise.all(employeesFixtureCompanyPremium.map(
    async item => await new EmployeeService(APP_SOURCE_SEEDER).createOne(item.employee, user.id),
  ))

  const employeeIds = employees.map(employee => employee.id)

  const event = await new EventService(APP_SOURCE_SEEDER).createOneEvent(
    {
      ...eventFixtureCompanyPremium.event,
      employeeIds,
      createdByUser: user.id,
    } as unknown as Partial<EventEntity>,
    user.id,
    1,
  )

  await addressService.createOne({
    address: eventFixtureCompanyPremium.address,
    eventId: event.id,
  })

  await answerService.createMany(event.id, employeeIds)
  const answer = await answerService.getOneAnswerForEventEmployee(event.id, employeeIds[0])
  if (answer) {
    answer.hasSigned = true
    answer.signedAt = new Date()
    await getManager.save(AnswerEntity, answer)
  }
}

// MEDIUM

export async function seedMediumUserData(APP_SOURCE_SEEDER: DataSource) {
  const getManager = APP_SOURCE_SEEDER.manager
  const addressService = new AddressService(APP_SOURCE_SEEDER)
  const answerService = new AnswerService(APP_SOURCE_SEEDER)

  const subscription = getManager.create(SubscriptionEntity, {
    type: SubscriptionEnum.MEDIUM,
    expireAt: dayjs().add(1, 'year'),
  })
  await getManager.save(subscription)

  const user = await new UserService(APP_SOURCE_SEEDER).createOneUser({
    ...userCompanyFixtureMedium,
    subscriptionId: subscription.id,
  })

  await addressService.createOne({
    address: addressFixtureCompanyMedium,
    userId: user.id,
  })

  const employees = await Promise.all(employeesFixtureCompanyMedium.map(
    async item => await new EmployeeService(APP_SOURCE_SEEDER).createOne(item.employee, user.id),
  ))

  const employeeIds = employees.map(employee => employee.id)

  const event = await new EventService(APP_SOURCE_SEEDER).createOneEvent(
    {
      ...eventFixtureCompanyMedium.event,
      employeeIds,
      createdByUser: user.id,
    } as unknown as Partial<EventEntity>,
    user.id,
    1,
  )

  await addressService.createOne({
    address: eventFixtureCompanyMedium.address,
    eventId: event.id,
  })

  await answerService.createMany(event.id, employeeIds)
  const answer = await answerService.getOneAnswerForEventEmployee(event.id, employeeIds[0])
  if (answer) {
    answer.hasSigned = true
    answer.signedAt = new Date()
    await getManager.save(AnswerEntity, answer)
  }
}
