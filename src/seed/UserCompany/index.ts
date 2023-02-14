import type { DataSource } from 'typeorm'
import dayjs from 'dayjs'
import UserService from '../../services/UserService'
import { AddressService } from '../../services/AddressService'
import EmployeeService from '../../services/EmployeeService'
import EventService from '../../services/EventService'
import AnswerService from '../../services/AnswerService'
import type EventEntity from '../../entity/EventEntity'
import { SubscriptionEnum } from '../../types'
import { SubscriptionEntity } from '../../entity/SubscriptionEntity'
import { UserEntity } from '../../entity/UserEntity'
import { MailjetService } from '../../services'
import type { EmployeeEntity } from '../../entity/EmployeeEntity'
import {
  addressFixtureCompanyMedium,
  addressFixtureCompanyPremium,
  employeesFixtureCompanyMedium,
  employeesFixtureCompanyPremium,
  eventFixtureCompanyMedium,
  eventFixtureCompanyPremium,
  userCompanyFixtureMedium,
  userCompanyFixturePremium,
  userNotUsed,
} from './fixtures'

export async function seedUserCompany(APP_SOURCE_SEEDER: DataSource) {
  const getManager = APP_SOURCE_SEEDER.manager
  const addressService = new AddressService(APP_SOURCE_SEEDER)
  const answerService = new AnswerService(APP_SOURCE_SEEDER)
  const mailService = new MailjetService(APP_SOURCE_SEEDER)

  const subscription = getManager.create(SubscriptionEntity, {
    type: SubscriptionEnum.PREMIUM,
    expireAt: dayjs().add(1, 'year'),
  })
  await getManager.save(subscription)

  const user = await new UserService(APP_SOURCE_SEEDER).createOneUser({
    ...userCompanyFixturePremium,
    subscription: SubscriptionEnum.PREMIUM,
  })

  await addressService.createOne({
    address: addressFixtureCompanyPremium,
    userId: user.id,
  })

  const employees = await Promise.all(employeesFixtureCompanyPremium.map(
    async item => {
      const emp = await new EmployeeService(APP_SOURCE_SEEDER).createOne(item.employee, user.id)
      await addressService.createOne({
        address: item.address,
        employeeId: emp.id,
      })
      return emp
    },
  ))

  const employeeIds = employees.map(employee => employee.id)

  const partner = await getManager.findOne(UserEntity, {
    where: {
      email: 'lee.jordan@poudlard.com',
    },
  })

  const event = await new EventService(APP_SOURCE_SEEDER).createOneEvent(
    {
      ...eventFixtureCompanyPremium.event,
      employeeIds,
      createdByUser: user.id,
      partner,
    } as unknown as Partial<EventEntity>,
    user.id,
    1,
  )

  await addressService.createOne({
    address: eventFixtureCompanyPremium.address,
    eventId: event.id,
  })

  const answers = await answerService.createMany(event.id, employeeIds)
  await Promise.all(answers.map(async ans => {
    const answerToSend = await answerService.getOne(ans.id, true)
    const employee = answerToSend.employee as EmployeeEntity

    return mailService.sendEmployeeMail({ answer: answerToSend, employee })
  }))

  const answer = await answerService.getOneAnswerForEventEmployee({
    eventId: event.id,
    employeeId: employeeIds[3],
  })

  if (answer) {
    await answerService.updateOneAnswer(answer.id, {
      ...answer,
      hasSigned: true,
      signedAt: new Date(),
    })
  }

  const answer2 = await answerService.getOneAnswerForEventEmployee({
    eventId: event.id,
    employeeId: employeeIds[2],
  })

  if (answer2) {
    await answerService.updateOneAnswer(answer2.id, {
      ...answer2,
      hasSigned: false,
      signedAt: new Date(),
    })
  }
}

// MEDIUM

export async function seedMediumUserData(APP_SOURCE_SEEDER: DataSource) {
  const getManager = APP_SOURCE_SEEDER.manager
  const addressService = new AddressService(APP_SOURCE_SEEDER)
  const answerService = new AnswerService(APP_SOURCE_SEEDER)

  const user = await new UserService(APP_SOURCE_SEEDER).createOneUser({
    ...userCompanyFixtureMedium,
    subscription: SubscriptionEnum.MEDIUM,
  })

  await addressService.createOne({
    address: addressFixtureCompanyMedium,
    userId: user.id,
  })

  const employees = await Promise.all(employeesFixtureCompanyMedium.map(
    async item => {
      const emp = await new EmployeeService(APP_SOURCE_SEEDER).createOne(item.employee, user.id)
      await addressService.createOne({
        address: item.address,
        employeeId: emp.id,
      })
      return emp
    },
  ))

  const employeeIds = employees.map(employee => employee.id)

  const partner = await getManager.findOne(UserEntity, {
    where: {
      email: 'rita.skitter@gazette.com',
    },
  })

  const event = await new EventService(APP_SOURCE_SEEDER).createOneEvent(
    {
      ...eventFixtureCompanyMedium.event,
      employeeIds,
      createdByUser: user.id,
      partner: partner.id,
    } as unknown as Partial<EventEntity>,
    user.id,
    1,
  )

  await addressService.createOne({
    address: eventFixtureCompanyMedium.address,
    eventId: event.id,
  })

  await answerService.createMany(event.id, employeeIds)

  const answer = await answerService.getOneAnswerForEventEmployee({
    eventId: event.id,
    employeeId: employeeIds[0],
  })

  await answerService.updateOneAnswer(answer.id, {
    ...answer,
    hasSigned: true,
    signedAt: new Date(),
  })

  const answer2 = await answerService.getOneAnswerForEventEmployee({
    eventId: event.id,
    employeeId: employeeIds[1],
  })

  await answerService.updateOneAnswer(answer2.id, {
    ...answer2,
    hasSigned: false,
    signedAt: new Date(),
  })
}

export async function seedUnUsedUser(APP_SOURCE_SEEDER: DataSource) {
  await new UserService(APP_SOURCE_SEEDER).createOneUser({
    ...userNotUsed,
    subscription: SubscriptionEnum.MEDIUM,
  })
}
