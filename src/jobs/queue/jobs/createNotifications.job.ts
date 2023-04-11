import type { Job } from 'bullmq'
import { APP_SOURCE } from '../../..'
import type AnswerEntity from '../../../entity/AnswerEntity'
import type EventEntity from '../../../entity/EventEntity'
import { logger } from '../../../middlewares/loggerService'
import { EventNotificationService } from '../../../services/notifications/EventNotificationService'
import { NotificationService } from '../../../services/notifications/NotificationService'
import { NotificationSubscriptionService } from '../../../services/notifications/NotificationSubscriptionService'
import type { NotificationTypeEnum } from '../../../types'
import type { JobImp } from './job.definition'
import { BaseJob } from './job.definition'

export class CreateEventNotificationsJob extends BaseJob implements JobImp {
  constructor(public payoad: {
    type: NotificationTypeEnum
    userId: number
    answer?: AnswerEntity
    event?: EventEntity
  }) {
    super()
  }

  handle = async () => {
    const {
      type,
      userId,
      answer,
      event,
    } = this.payoad

    if (type && (answer || event)) {
      const eventNotificationService = new EventNotificationService(APP_SOURCE)

      const eventNotif = await eventNotificationService.createOne({
        name: type,
        answer: answer || null,
        event: event || null,
      })

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
    }
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
