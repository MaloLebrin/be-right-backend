import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import { IsNull, Not } from 'typeorm'
import { NotificationEntity } from '../../entity/notifications/Notification.entity'
import { logger } from '../../middlewares/loggerService'

export async function deleteReadOldNotifications(APP_SOURCE: DataSource) {
  try {
    const now = dayjs().locale('fr')
    const yearAgoDate = now.subtract(1, 'year')
    const dateStart = now.format('YYYY-MM-DD-HH-mm')
    logger.info(`Sarting cron delete old read notifications status at ${dateStart}`)

    const NotificationRepository = APP_SOURCE.getRepository(NotificationEntity)

    const notifications = await NotificationRepository.find({
      where: {
        readAt: Not(null),
        deletedAt: IsNull(),
      },
    })

    const notificationIdsToDelete = notifications
      .filter(notif =>
        dayjs(notif.readAt).isBefore(yearAgoDate) && dayjs(notif.createdAt).isBefore(yearAgoDate))
      .map(notif => notif.id)

    if (notificationIdsToDelete?.length > 0) {
      await NotificationRepository.softDelete(notificationIdsToDelete)
    }
  } catch (error) {
    logger.error(error, 'error')
  } finally {
    const dateEnd = dayjs().locale('fr').format('YYYY-MM-DD-HH-mm')
    logger.info(`cron delete old read notifications status ended at ${dateEnd}`)
  }
}
