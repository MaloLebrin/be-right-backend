import dayjs from 'dayjs'
import type { DataSource } from 'typeorm'
import { IsNull, LessThan } from 'typeorm'
import { UserEntity } from '../../entity/UserEntity'
import { logger } from '../../middlewares/loggerService'

export default async function deleteUnusedUsersJob(APP_SOURCE: DataSource) {
  try {
    const now = dayjs().locale('fr')
    const dateStart = now.format('YYYY-MM-DD-HH-mm')
    logger.info(`Sarting delete Users status at ${dateStart}`)

    const twoYearAgo = now.subtract(2, 'year').toDate()

    const UserRepository = APP_SOURCE.getRepository(UserEntity)
    const users = await UserRepository.find({
      where: [
        {
          loggedAt: IsNull(),
          createdAt: LessThan(twoYearAgo),
        },
        {
          loggedAt: LessThan(twoYearAgo),
          createdAt: LessThan(twoYearAgo),
        },
      ],
    })

    if (users.length > 0) {
      const usersToDelete = users
        .map(user => user.id)

      await UserRepository.softDelete(usersToDelete)
    }

    logger.info(users.length, 'usersToDelete')
  } catch (error) {
    logger.error(error, 'error')
  } finally {
    const dateEnd = dayjs().locale('fr').format('YYYY-MM-DD-HH-mm')
    logger.info(`delete Users status ended at ${dateEnd}`)
  }
}
