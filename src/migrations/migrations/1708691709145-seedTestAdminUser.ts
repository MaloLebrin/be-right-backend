import { logger } from "../../middlewares/loggerService"
import { isProduction } from "../../utils/envHelper"
import { MigrationCustomInterface } from "../../types/Migrations"
import { UserAdminSeed } from "../../seed/admin"

export async function SeedTestAdminUser1708691709145({name, SOURCE}: MigrationCustomInterface) {
    try {
        logger.info(`Migration ${name} started`)
        const SeedClass = new UserAdminSeed(SOURCE)
    
        await SeedClass.CreateAdminUser()
        
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
