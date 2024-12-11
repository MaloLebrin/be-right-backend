import { MigrationCustomInterface } from "../../types/Migrations"
import { logger } from "../../middlewares/loggerService"
import { isProduction } from "../../utils/envHelper"
import { UserEntity } from "../../entity/UserEntity"
import { SettingEntity } from "../../entity/SettingEntity"
import { ThemeEnum } from "../../types"

export async function CreateSettingsEntities1733776782367({
    name,
    SOURCE,
  }: MigrationCustomInterface) {
    try {
      logger.info(`Migration ${name} started`)

      const users: {id: number}[] = await SOURCE.getRepository(UserEntity).find({
        select: {
            id: true,
        }
      })

      await SOURCE.getRepository(SettingEntity).insert(users.map(({id }) => ({
        user : { id },
        theme: ThemeEnum.LIGHT,
        paginatedRequestLimit: {
          events: 20,
          notifications: 20,
          recipients: 20,
        },
      })))

      return {
        success: true,
        name,
      }
    } catch (error) {
      if (!isProduction()) {
        console.error(error, '<==== error')
      }
      logger.error(`An error occurred for migration ${name}`, error)
      return {
        success: false,
        name,
      }
    } finally {
      logger.info(`Migration ${name} ended`)
    }
  }
  