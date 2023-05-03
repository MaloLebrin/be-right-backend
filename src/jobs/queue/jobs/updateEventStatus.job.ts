import type { Job } from 'bullmq'
import { APP_SOURCE } from '../../..'
import { logger } from '../../../middlewares/loggerService'
import EventService from '../../../services/EventService'
import { EventNotificationService } from '../../../services/notifications/EventNotificationService'
import { NotificationSubscriptionService } from '../../../services/notifications/NotificationSubscriptionService'
import { NotificationService } from '../../../services/notifications/NotificationService'
import { getNotificationTypeByEventStatus } from '../../../utils/notificationHelper'
import { CompanyEntity } from '../../../entity/Company.entity'
import { EventStatusEnum } from '../../../types'
import { MailjetService } from '../../../services/MailjetService'
import { BaseJob } from './job.definition'
import type { JobImp } from './job.definition'

export class UpdateEventStatusJob extends BaseJob implements JobImp {
  constructor(public payoad: { eventId: number }) {
    super()
  }

  handle = async () => {
    const eventService = new EventService(APP_SOURCE)
    const { eventId } = this.payoad
    const event = await eventService.getOneEvent(eventId)

    if (event) {
      logger.info(event, 'event')
      await eventService.getNumberSignatureNeededForEvent(event.id)
      await eventService.updateStatusEventWhenCompleted(event)
      await eventService.updateStatusForEventArray([event])

      const eventUpdated = await eventService.getOneWithoutRelations(event.id)

      if (eventUpdated && eventUpdated.status !== event.status) {
        const eventNotificationService = new EventNotificationService(APP_SOURCE)

        const eventNotif = await eventNotificationService.createOne({
          name: getNotificationTypeByEventStatus(event),
          event,
        })

        const company = await APP_SOURCE.getRepository(CompanyEntity).findOne({
          where: {
            id: event.companyId,
          },
          relations: {
            users: true,
          },
        })

        if (company && company.userIds.length > 0) {
          const notificationSubscriptionService = new NotificationSubscriptionService(APP_SOURCE)

          await Promise.all(company.userIds.map(async id => {
            const notifSubscription = await notificationSubscriptionService.getOneByUserAndType({
              type: getNotificationTypeByEventStatus(event),
              userId: id,
            })

            if (eventNotif && notifSubscription) {
              const notificationService = new NotificationService(APP_SOURCE)
              await notificationService.createOne({
                type: getNotificationTypeByEventStatus(event),
                subscriber: notifSubscription,
                eventNotificationId: eventNotif.id,
              })
            }
          }))
        }
      }

      if (event.status === EventStatusEnum.COMPLETED) {
        const company = await APP_SOURCE.getRepository(CompanyEntity).findOne({
          where: {
            id: event.companyId,
          },
          relations: {
            users: true,
          },
        })

        if (company && company.users.length > 0) {
          const mailjetService = new MailjetService(APP_SOURCE)
          await mailjetService.sendEventCompletedEmail({
            event,
            users: company.users,
          })
        }
      }
    }
  }

  failed = (job: Job) => {
    logger.error(`Job(${this.name}) with ID: ${job.id} has failed`)
  }
}
