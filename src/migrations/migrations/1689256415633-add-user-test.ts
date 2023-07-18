import { UserSeedClass } from "../../seed/UserCompany/UserSeedClass"
import { MigrationCustomInterface } from "../../types/Migrations"
import { logger } from "../../middlewares/loggerService"

export async function addUserTest1689256415633({
  name,
  SOURCE,
}: MigrationCustomInterface) {
  try {
    logger.info(`Migration ${name} started`)
    const SeedClass = new UserSeedClass(SOURCE)

    await SeedClass.seedUserPremium()
  } catch (error) {
    logger.error(`An error occurred for migration ${name}`, error)
  } finally {
    logger.info(`Migration ${name} ended`)
  }
}
