import type { DataSource } from 'typeorm'
import dayjs from 'dayjs'
import UserService from '../../services/UserService'
import { AddressService } from '../../services/AddressService'
import EmployeeService from '../../services/EmployeeService'
import EventService from '../../services/EventService'
import AnswerService from '../../services/AnswerService'
import type EventEntity from '../../entity/EventEntity'
import { NotificationTypeEnum, NotificationTypeEnumArray, SubscriptionEnum } from '../../types'
import { SubscriptionEntity } from '../../entity/SubscriptionEntity'
import { UserEntity } from '../../entity/UserEntity'
import { MailjetService } from '../../services'
import type { EmployeeEntity } from '../../entity/EmployeeEntity'
import { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import { EventNotificationEntity } from '../../entity/bases/EventNotification.entity'
import { NotificationEntity } from '../../entity/notifications/Notification.entity'
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

  await Promise.all(NotificationTypeEnumArray.map(async value => {
    const sub = getManager.create(NotificationSubcriptionEntity, {
      createdByUser: user,
      type: value,
    })
    return await getManager.save(sub)
  }))

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
      totalSignatureNeeded: employeeIds.length,
      createdByUser: user.id,
      partner,
    } as unknown as Partial<EventEntity>,
    user.id,
    1,
  )

  const eventNotif = getManager.create(EventNotificationEntity, {
    name: NotificationTypeEnum.EVENT_CREATED,
    event,
  })
  await getManager.save(eventNotif)
  const subscriber = await getManager.findOne(NotificationSubcriptionEntity, {
    where: {
      type: NotificationTypeEnum.EVENT_CREATED,
      createdByUser: {
        id: user.id,
      },
    },
  })
  const notif = getManager.create(NotificationEntity, {
    eventNotification: eventNotif,
    type: NotificationTypeEnum.EVENT_CREATED,
    subscriber,
  })

  await getManager.save(notif)

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
    employeeId: 2,
  })

  if (answer) {
    await answerService.updateOneAnswer(answer.id, {
      ...answer,
      hasSigned: true,
      signedAt: new Date(),
    })

    const answerEventNotif = getManager.create(EventNotificationEntity, {
      name: NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED,
      answer,
    })
    await getManager.save(answerEventNotif)
    const subscriber = await getManager.findOne(NotificationSubcriptionEntity, {
      where: {
        type: NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED,
        createdByUser: {
          id: user.id,
        },
      },
    })
    const answerNotif = getManager.create(NotificationEntity, {
      eventNotification: answerEventNotif,
      type: NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED,
      subscriber,
    })
    await getManager.save(answerNotif)
  }

  const answer2 = await answerService.getOneAnswerForEventEmployee({
    eventId: event.id,
    employeeId: 1,
  })

  if (answer2) {
    await answerService.updateOneAnswer(answer2.id, {
      ...answer2,
      hasSigned: false,
      signedAt: new Date(),
    })

    const answerEventNotif2 = getManager.create(EventNotificationEntity, {
      name: NotificationTypeEnum.ANSWER_RESPONSE_REFUSED,
      answer: answer2,
    })
    await getManager.save(answerEventNotif2)
    const subscriber = await getManager.findOne(NotificationSubcriptionEntity, {
      where: {
        type: NotificationTypeEnum.ANSWER_RESPONSE_REFUSED,
        createdByUser: {
          id: user.id,
        },
      },
    })
    const answerNotif2 = getManager.create(NotificationEntity, {
      eventNotification: answerEventNotif2,
      type: NotificationTypeEnum.ANSWER_RESPONSE_REFUSED,
      subscriber,
    })
    await getManager.save(answerNotif2)
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

  await Promise.all([
    NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED,
    NotificationTypeEnum.ANSWER_RESPONSE_REFUSED,
    NotificationTypeEnum.EVENT_CLOSED,
    NotificationTypeEnum.EVENT_COMPLETED,
  ].map(async value => {
    const sub = getManager.create(NotificationSubcriptionEntity, {
      createdByUser: user,
      type: value,
    })
    return await getManager.save(sub)
  }))

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
      totalSignatureNeeded: employeeIds.length,
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
