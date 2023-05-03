import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import { IsNull, LessThan } from 'typeorm'
import EventEntity from '../../entity/EventEntity'
import { logger } from '../../middlewares/loggerService'

export async function deleteOldEventsJob(APP_SOURCE: DataSource) {
  try {
    const now = dayjs().locale('fr')
    const yearAgoDate = now.subtract(1, 'year')
    const dateStart = now.format('YYYY-MM-DD-HH-mm')
    logger.info(`Sarting cron delete old events status at ${dateStart}`)

    const EventRepository = APP_SOURCE.getRepository(EventEntity)

    const events = await EventRepository.find({
      where: {
        deletedAt: IsNull(),
        end: LessThan(yearAgoDate.toDate()),
      },
    })

    if (events?.length > 0) {
      await EventRepository.softDelete(events.map(event => event.id))
    }
  } catch (error) {
    logger.error(error, 'error')
  } finally {
    const dateEnd = dayjs().locale('fr').format('YYYY-MM-DD-HH-mm')
    logger.info(`cron delete old events status ended at ${dateEnd}`)
  }
}
