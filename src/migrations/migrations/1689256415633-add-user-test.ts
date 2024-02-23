import { UserSeedClass } from "../../seed/UserCompany/UserSeedClass"
import { MigrationCustomInterface } from "../../types/Migrations"
import { logger } from "../../middlewares/loggerService"
import { isProduction } from "../../utils/envHelper"

export async function addUserTest1689256415633({
  name,
  SOURCE,
}: MigrationCustomInterface) {
  try {
    logger.info(`Migration ${name} started`)
    const SeedClass = new UserSeedClass(SOURCE)

    await SeedClass.seedUserPremium()
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
