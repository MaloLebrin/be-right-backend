import type { Job } from 'bullmq'
import { APP_SOURCE } from '../../..'
import { logger } from '../../../middlewares/loggerService'
import { NotificationService } from '../../../services/notifications/NotificationService'
import { NotificationSubscriptionService } from '../../../services/notifications/NotificationSubscriptionService'
import type { NotificationTypeEnum } from '../../../types'
import type { EmployeeEntity } from '../../../entity/employees/EmployeeEntity'
import { EventNotificationEntity } from '../../../entity/bases/EventNotification.entity'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

export class CreateEmployeeNotificationsJob extends BaseJob implements JobImp {
  constructor(public payoad: {
    type: NotificationTypeEnum
    userId: number
    employees: EmployeeEntity[]
  }) {
    super()
  }

  handle = async () => {
    const {
      type,
      userId,
      employees,
    } = this.payoad

    if (type && employees) {
      const eventsNotifs = APP_SOURCE.getRepository(EventNotificationEntity).create(employees.map(employee => ({
        name: type,
        employee,
      })))

      await APP_SOURCE.getRepository(EventNotificationEntity).save(eventsNotifs)

      await Promise.all(eventsNotifs.map(async eventNotif => {
        const notificationSubscriptionService = new NotificationSubscriptionService(APP_SOURCE)

        const notifSubscription = await notificationSubscriptionService.getOneByUserAndType({
          type,
          userId,
        })

        if (eventNotif && notifSubscription) {
          const notificationService = new NotificationService(APP_SOURCE)
          await notificationService.createOne({
            type,
            subscriber: notifSubscription,
            eventNotificationId: eventNotif.id,
          })
        }
      }))
    }
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
