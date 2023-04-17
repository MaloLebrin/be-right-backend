import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import { LessThan, Not } from 'typeorm'
import EventEntity from '../../entity/EventEntity'
import { logger } from '../../middlewares/loggerService'
import EventService from '../../services/EventService'
import { EventStatusEnum } from '../../types'

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
      await eventService.updateStatusForEventArray(events)
      await Promise.all(events.map(async event => this.updateStatusEventWhenCompleted(event)))
    }
  } catch (error) {
    logger.error(error, 'error')
  } finally {
    const dateEnd = now.format('YYYY-MM-DD-HH-mm')
    logger.warn(`update event status ended at ${dateEnd}`)
  }
}
