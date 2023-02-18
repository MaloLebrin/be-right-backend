import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import EventEntity from '../../entity/EventEntity'
import { useLogger } from '../../middlewares/loggerService'
import EventService from '../../services/EventService'

export default async function udpateEventStatusJob(APP_SOURCE: DataSource) {
  const { logger } = useLogger()

  try {
    const dateStart = dayjs().locale('fr').format('YYYY-MM-DD-HH-mm')
    logger.warn(`Sarting update event status at ${dateStart}`)

    const eventService = new EventService(APP_SOURCE)

    const events = await APP_SOURCE.manager.find(EventEntity)
    logger.info(events.length, 'events')

    if (events.length > 0) {
      await eventService.updateStatusForEventArray(events)
    }
  } catch (error) {
    logger.error(error, 'error')
  } finally {
    const dateEnd = dayjs().locale('fr').format('YYYY-MM-DD-HH-mm')
    logger.warn(`update event status ended at ${dateEnd}`)
  }
}
