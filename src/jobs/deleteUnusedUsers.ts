import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import { UserEntity } from '../entity/UserEntity'
import { useLogger } from '../middlewares/loggerService'
import UserService from '../services/UserService'

export default async function deleteUnusedUsersJob(APP_SOURCE: DataSource) {
  const { logger } = useLogger()

  try {
    const now = dayjs().locale('fr')
    const yearAgoDate = now.subtract(1, 'year')
    const dateStart = now.format('YYYY-MM-DD-HH-mm')
    logger.info(`Sarting delete Users status at ${dateStart}`)

    const userService = new UserService(APP_SOURCE)

    const users = await APP_SOURCE.manager.find(UserEntity)

    const usersToDelete = users.filter(user =>
      (user.loggedAt === null || dayjs(user.loggedAt).isBefore(yearAgoDate)) && dayjs(user.createdAt).isBefore(yearAgoDate))
      .map(user => user.id)

    await userService.deleteMany(usersToDelete)

    logger.info(usersToDelete.length, 'usersToDelete')
  } catch (error) {
    logger.error(error, 'error')
  } finally {
    const dateEnd = dayjs().locale('fr').format('YYYY-MM-DD-HH-mm')
    logger.info(`delete Users status ended at ${dateEnd}`)
  }
}
