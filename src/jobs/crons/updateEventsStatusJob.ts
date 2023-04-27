import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import { LessThan, Not } from 'typeorm'
import EventEntity from '../../entity/EventEntity'
import { logger } from '../../middlewares/loggerService'
import EventService from '../../services/EventService'
import { EventStatusEnum } from '../../types'
import { updateStatusEventBasedOnStartEndTodayDate } from '../../utils/eventHelpers'
import { CompanyEntity } from '../../entity/Company.entity'
import { MailjetService } from '../../services/MailjetService'

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
    })
    logger.info(events.length, 'events')

    if (events.length > 0) {
      const promises = await Promise.all([
        ...events.map(async event => EventRepository.update(event.id, {
          status: updateStatusEventBasedOnStartEndTodayDate(event),
        })),
        ...events.map(event => eventService.getNumberSignatureNeededForEvent(event.id)),
        ...events.map(event => eventService.updateStatusEventWhenCompleted(event)),
      ])

      const eventsCompleted = promises.filter((item: EventEntity) =>
        item.status
        && item.status === EventStatusEnum.COMPLETED
        && dayjs(item.updatedAt).isAfter(now.subtract(1, 'hour')))

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
    }
  } catch (error) {
    logger.error(error, 'error')
  } finally {
    const dateEnd = now.format('YYYY-MM-DD-HH-mm')
    logger.warn(`update event status ended at ${dateEnd}`)
  }
}
