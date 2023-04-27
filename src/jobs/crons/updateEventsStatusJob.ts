import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import { In, LessThan, Not } from 'typeorm'
import EventEntity from '../../entity/EventEntity'
import { logger } from '../../middlewares/loggerService'
import EventService from '../../services/EventService'
import { EventStatusEnum } from '../../types'
import { updateStatusEventBasedOnStartEndTodayDate } from '../../utils/eventHelpers'
import { CompanyEntity } from '../../entity/Company.entity'
import { MailjetService } from '../../services/MailjetService'
import { uniq } from '../../utils/arrayHelper'
import { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import { EventNotificationService } from '../../services/notifications/EventNotificationService'
import { getNotificationTypeByEventStatus } from '../../utils/notificationHelper'
import { NotificationService } from '../../services/notifications/NotificationService'

export default async function udpateEventStatusJob(APP_SOURCE: DataSource) {
  const now = dayjs().locale('fr')

  try {
    const dateStart = now.format('YYYY-MM-DD-HH-mm')
    logger.warn(`Sarting update event status at ${dateStart}`)

    const EventRepository = APP_SOURCE.getRepository(EventEntity)
    const eventService = new EventService(APP_SOURCE)

    const events = await EventRepository.find({
      where: [
        {
          status: Not(EventStatusEnum.CLOSED),
          end: LessThan(now.subtract(1, 'day').toDate()),
        },
      ],
      relations: ['company.users'],
    })
    logger.info(events.length, 'events')

    if (events.length > 0) {
      const promises = await Promise.all([
        ...events.map(async event => EventRepository.update(event.id, {
          updatedAt: now,
          status: updateStatusEventBasedOnStartEndTodayDate(event),
        })),
        ...events.map(event => eventService.getNumberSignatureNeededForEvent(event.id)),
        ...events.map(event => eventService.updateStatusEventWhenCompleted(event)),
      ])

      const eventsCompleted = promises.filter((item: EventEntity) =>
        item.status
        && item.status === EventStatusEnum.COMPLETED
        && dayjs(item.updatedAt).isAfter(now.subtract(1, 'hour'))) as EventEntity[]

      if (eventsCompleted.length > 0) {
        await Promise.all(eventsCompleted.map(async (event: EventEntity) => {
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
            return mailjetService.sendEventCompletedEmail({
              event,
              users: company.users,
            })
          }
        }))
      }

      const eventNeedNotifs = promises.filter((item: EventEntity) =>
        item.status
        && dayjs(item.updatedAt).isAfter(now.subtract(1, 'hour'))) as EventEntity[]

      if (eventNeedNotifs.length > 0) {
        const userIds = uniq(eventNeedNotifs.reduce((acc, event) => [...acc, ...event.company.userIds], [] as number[]))
        if (userIds.length > 0) {
          const notifSubscriptions = await APP_SOURCE.getRepository(NotificationSubcriptionEntity).find({
            where: {
              createdByUser: {
                id: In(userIds),
              },
            },
            relations: [
              'createdByUser.company',
            ],
          })

          const eventNotificationService = new EventNotificationService(APP_SOURCE)
          const notificationService = new NotificationService(APP_SOURCE)

          await Promise.all(eventNeedNotifs.map(async event => {
            const notifSubscription = notifSubscriptions.find(notifSub => notifSub.createdByUser.companyId === event.companyId)
            if (notifSubscription) {
              const eventNotif = await eventNotificationService.createOne({
                name: getNotificationTypeByEventStatus(event),
                event,
              })

              return notificationService.createOne({
                type: getNotificationTypeByEventStatus(event),
                subscriber: notifSubscription,
                eventNotificationId: eventNotif.id,
              })
            }
          }))
        }
      }
    }
  } catch (error) {
    logger.error(error, 'error')
  } finally {
    const dateEnd = now.format('YYYY-MM-DD-HH-mm')
    logger.warn(`update event status ended at ${dateEnd}`)
  }
}
