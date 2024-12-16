import { MigrationCustomInterface } from "../../types/Migrations"
import { logger } from "../../middlewares/loggerService"
import { isProduction } from "../../utils/envHelper"
import { RepositorySeeder } from "../../seed/repositories/RepositorySeeder"

export async function SeedRepositories1734335069060({
    name,
    SOURCE,
}: MigrationCustomInterface) {
    try {
        logger.info(`Migration ${name} started`)

        const Seeder = new RepositorySeeder(SOURCE)

        await Seeder.startRepositoriesSeeders()

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
