import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import csv from 'csvtojson'
import { EventNotificationEntity } from '../../entity/bases/EventNotification.entity'
import EventEntity from '../../entity/EventEntity'
import { NotificationEntity } from '../../entity/notifications/Notification.entity'
import { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import { SubscriptionEntity } from '../../entity/SubscriptionEntity'
import { UserEntity } from '../../entity/UserEntity'
import type { UploadCSVEmployee } from '../../types'
import { NotificationTypeEnum, NotificationTypeEnumArray, SubscriptionEnum } from '../../types'
import { photographerFixture1, photographerFixture2, photographerFixture3, photographerFixture4 } from '../shared/photographerFixtures'
import { BaseSeedClass } from '../Base/BaseSeedClass'
import { GroupService } from '../../services/employee/GroupService'
import { updateStatusEventBasedOnStartEndTodayDate } from '../../utils/eventHelpers'
import {
  addressFixtureCompanyMedium,
  addressFixtureCompanyPremium,
  employeesFixtureCompanyMedium,
  employeesFixtureCompanyPremium,
  event2FixtureCompanyPremium,
  eventFixtureCompanyMedium,
  eventFixtureCompanyPremium,
  userCompanyFixtureMedium,
  userCompanyFixturePremium,
  userNotUsed,
} from './fixtures'

export class UserSeedClass extends BaseSeedClass {
  GroupService: GroupService

  constructor(SEED_SOURCE: DataSource) {
    super(SEED_SOURCE)
    this.GroupService = new GroupService(SEED_SOURCE)
  }

  private async photographersSeeder() {
    const photographersPayload = [
      photographerFixture1,
      photographerFixture2,
      photographerFixture3,
      photographerFixture4,
    ]

    await Promise.all(photographersPayload.map(async photographer =>
      await this.UserService.createOnePhotoGrapher(photographer),
    ))
  }

  private async seedUnUsedUser() {
    await this.UserService.createOneUser({
      ...userNotUsed,
      subscription: SubscriptionEnum.MEDIUM,
    })
  }

  private async seedCSVEmployee(userId: number) {
    const pathF = '/app/src/seed/UserCompany/testcsv.csv'

    const newEmployeesData: UploadCSVEmployee[] = await csv().fromFile(pathF)

    const employees = await Promise.all(newEmployeesData.map(async ({
      firstName,
      lastName,
      addressLine,
      postalCode,
      city,
      country,
      email,
      phone,
    }) => {
      const isEmployeeAlreadyExist = await this.EmployeeService.isEmployeeAlreadyExist(email)

      if (!isEmployeeAlreadyExist) {
        const emp = await this.EmployeeService.createOne({
          firstName,
          lastName,
          email,
          phone,
        }, userId)

        if (emp) {
          await this.AddressService.createOne({
            address: {
              addressLine,
              postalCode,
              city,
              country,
            },
            employeeId: emp.id,
          })
          return emp
        }
      }
    }))

    await this.GroupService.createOne({
      name: 'Armée de Dumbledore',
      description: 'Dans l\'histoire, l\'organisation est fondée à l\'école de sorcellerie Poudlard par Harry Potter, sur le conseil d\'Hermione Granger, dans le but de contrer le système mis en place par l\'un des professeurs de cinquième année et déléguée du Ministère de la Magie, Dolores Ombrage. L\'Armée de Dumbledore (formée à l\'insu du directeur Albus Dumbledore, dont elle porte le nom) est une organisation comptant uniquement des élèves souhaitant s\'entrainer à manipuler les sortilèges de défense contre les forces du mal, ce qui leur est devenu interdit. L\'organisation fait écho à l\'Ordre du Phénix, composée d\'adultes cette fois, reformée la même année à l\'extérieur de l’école et visant à contrer le mage noir Voldemort et ses partisans. Vingt- neuf élèves, de différentes maisons de Poudlard, se sont au total inscrits à l\'AD. Il y a dix-sept membres de Gryffondor, sept de Serdaigle et cinq de Poufsouffle. Aucun élève de Serpentard n\'y est inscrit. ',
      employeeIds: employees.map(emp => emp.id),
    }, userId)

    await this.GroupService.createOne({
      name: 'Gryffondor',
      description: 'À l\'école de sorcellerie Poudlard, décrite principalement dans l\'univers de la série littéraire Harry Potter, il existe quatre maisons distinctes : « Gryffondor », « Poufsouffle », « Serdaigle » et « Serpentard »1. Les élèves y sont répartis par le Choixpeau magique dès leur première année à l\'école, en fonction de leur personnalité. Ils y restent jusqu\'à leur septième et dernière année d\'études. ',
      employeeIds: employees
        .filter(emp => !['Patil', 'Lovegood'].includes(emp.lastName))
        .map(emp => emp.id),
    }, userId)

    const partner = await this.getManager.findOne(UserEntity, {
      where: {
        email: 'lee.jordan@poudlard.com',
      },
    })

    const user = await this.UserService.getOne(userId)

    const recipients = employees

    await this.EventService.createOneEvent(
      {
        ...event2FixtureCompanyPremium.event,
        createdByUser: user,
        employeeIds: recipients.map(emp => emp.id),
        totalSignatureNeeded: recipients.length,
        partner,
      } as unknown as Partial<EventEntity>,
      userId,
      partner.id,
    )
  }

  private async seedUserPremium() {
    const subscription = this.getManager.create(SubscriptionEntity, {
      type: SubscriptionEnum.PREMIUM,
      expireAt: dayjs().add(1, 'year'),
    })
    await this.getManager.save(subscription)

    const user = await this.UserService.createOneUser({
      ...userCompanyFixturePremium,
      subscription: SubscriptionEnum.PREMIUM,
    })

    await Promise.all(NotificationTypeEnumArray.map(async value => {
      const sub = this.getManager.create(NotificationSubcriptionEntity, {
        createdByUser: user,
        type: value,
      })
      return await this.getManager.save(sub)
    }))

    await this.AddressService.createOne({
      address: addressFixtureCompanyPremium,
      userId: user.id,
    })

    const employees = await Promise.all(employeesFixtureCompanyPremium.map(
      async item => {
        const emp = await this.EmployeeService.createOne(item.employee, user.id)
        await this.AddressService.createOne({
          address: item.address,
          employeeId: emp.id,
        })
        return emp
      },
    ))

    await this.seedCSVEmployee(user.id)

    const employeeIds = employees.map(employee => employee.id)

    const partner = await this.getManager.findOne(UserEntity, {
      where: {
        email: 'lee.jordan@poudlard.com',
      },
    })

    const event = await this.EventService.createOneEvent(
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

    const eventNotif = this.getManager.create(EventNotificationEntity, {
      name: NotificationTypeEnum.EVENT_CREATED,
      event,
    })
    await this.getManager.save(eventNotif)
    const subscriber = await this.getManager.findOne(NotificationSubcriptionEntity, {
      where: {
        type: NotificationTypeEnum.EVENT_CREATED,
        createdByUser: {
          id: user.id,
        },
      },
    })
    const notif = this.getManager.create(NotificationEntity, {
      eventNotification: eventNotif,
      type: NotificationTypeEnum.EVENT_CREATED,
      subscriber,
    })

    await this.getManager.save(notif)

    await this.AddressService.createOne({
      address: eventFixtureCompanyPremium.address,
      eventId: event.id,
    })

    await this.AnswerService.createMany(event.id, employeeIds)

    const answer = await this.AnswerService.getOneAnswerForEventEmployee({
      eventId: event.id,
      employeeId: 2,
    })

    if (answer) {
      await this.AnswerService.updateOneAnswer(answer.id, {
        ...answer,
        hasSigned: true,
        signedAt: new Date(),
      })

      const answerEventNotif = this.getManager.create(EventNotificationEntity, {
        name: NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED,
        answer,
      })
      await this.getManager.save(answerEventNotif)
      const subscriber = await this.getManager.findOne(NotificationSubcriptionEntity, {
        where: {
          type: NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED,
          createdByUser: {
            id: user.id,
          },
        },
      })
      const answerNotif = this.getManager.create(NotificationEntity, {
        eventNotification: answerEventNotif,
        type: NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED,
        subscriber,
      })
      await this.getManager.save(answerNotif)
    }

    const answer2 = await this.AnswerService.getOneAnswerForEventEmployee({
      eventId: event.id,
      employeeId: 1,
    })

    if (answer2) {
      await this.AnswerService.updateOneAnswer(answer2.id, {
        ...answer2,
        hasSigned: false,
        signedAt: new Date(),
      })

      const answerEventNotif2 = this.getManager.create(EventNotificationEntity, {
        name: NotificationTypeEnum.ANSWER_RESPONSE_REFUSED,
        answer: answer2,
      })
      await this.getManager.save(answerEventNotif2)
      const subscriber = await this.getManager.findOne(NotificationSubcriptionEntity, {
        where: {
          type: NotificationTypeEnum.ANSWER_RESPONSE_REFUSED,
          createdByUser: {
            id: user.id,
          },
        },
      })
      const answerNotif2 = this.getManager.create(NotificationEntity, {
        eventNotification: answerEventNotif2,
        type: NotificationTypeEnum.ANSWER_RESPONSE_REFUSED,
        subscriber,
      })
      await this.getManager.save(answerNotif2)
    }
  }

  private async seedUserMedium() {
    const user = await this.UserService.createOneUser({
      ...userCompanyFixtureMedium,
      subscription: SubscriptionEnum.MEDIUM,
    })

    await Promise.all([
      NotificationTypeEnum.ANSWER_RESPONSE_ACCEPTED,
      NotificationTypeEnum.ANSWER_RESPONSE_REFUSED,
      NotificationTypeEnum.EVENT_CLOSED,
      NotificationTypeEnum.EVENT_COMPLETED,
    ].map(async value => {
      const sub = this.getManager.create(NotificationSubcriptionEntity, {
        createdByUser: user,
        type: value,
      })
      return await this.getManager.save(sub)
    }))

    await this.AddressService.createOne({
      address: addressFixtureCompanyMedium,
      userId: user.id,
    })

    const employees = await Promise.all(employeesFixtureCompanyMedium.map(
      async item => {
        const emp = await this.EmployeeService.createOne(item.employee, user.id)
        await this.AddressService.createOne({
          address: item.address,
          employeeId: emp.id,
        })
        return emp
      },
    ))

    const employeeIds = employees.map(employee => employee.id)

    const partner = await this.getManager.findOne(UserEntity, {
      where: {
        email: 'rita.skitter@gazette.com',
      },
    })

    const event = await this.EventService.createOneEvent(
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

    await this.AddressService.createOne({
      address: eventFixtureCompanyMedium.address,
      eventId: event.id,
    })

    await this.AnswerService.createMany(event.id, employeeIds)

    const answer = await this.AnswerService.getOneAnswerForEventEmployee({
      eventId: event.id,
      employeeId: employeeIds[0],
    })

    await this.AnswerService.updateOneAnswer(answer.id, {
      ...answer,
      hasSigned: true,
      signedAt: new Date(),
    })

    const answer2 = await this.AnswerService.getOneAnswerForEventEmployee({
      eventId: event.id,
      employeeId: employeeIds[1],
    })

    await this.AnswerService.updateOneAnswer(answer2.id, {
      ...answer2,
      hasSigned: false,
      signedAt: new Date(),
    })
  }

  public async SeedDataBase() {
    await this.photographersSeeder()
    await this.seedUserPremium()
    await this.seedUserMedium()
    await this.seedUnUsedUser()
    await this.UpdateStatusEventSeeded()
  }

  private async UpdateStatusEventSeeded() {
    const events = await this.getManager.find(EventEntity, {
      take: 9999,
    })
    await Promise.all(events.map(event => {
      return this.getManager.update(EventEntity, {
        id: event.id,
      }, {
        status: updateStatusEventBasedOnStartEndTodayDate(event),
      })
    }))
  }
}
