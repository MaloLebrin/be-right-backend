import { MigrationCustomInterface } from "../../types/Migrations"
import { logger } from "../../middlewares/loggerService"
import { UserEntity } from "../../entity/UserEntity"
import { createNotificationToken } from "../../utils/userHelper"
import { isProduction } from "../../utils/envHelper"

export async function addNotificationTokenToUser({
  name,
  SOURCE,
}: MigrationCustomInterface) {
  try {
    logger.info(`Migration ${name} started`)

    if (SOURCE.isInitialized) {
      const UserRepository = SOURCE.getRepository(UserEntity)

      const users = await UserRepository.find({
        select: {
          id: true,
        }
      })
      await Promise.all(users.map(async ({ id }) => 
        await UserRepository.update(id, { notificationToken: createNotificationToken(id) })
      ))
    }

    return {
      success: true,
      name,
    }
  } catch (error) {
    if (!isProduction()) {
      console.error(error, '<==== error')
    }
    logger.error(`An error occurred for migration ${name} `, error)
    return {
      success: false,
      name,
    }
  } finally {
    logger.info(`Migration ${name} ended`)
  }
}
