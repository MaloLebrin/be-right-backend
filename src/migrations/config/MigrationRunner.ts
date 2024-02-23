import { MigrationRunnerPayload } from "../../types/Migrations"
import { migrationScripts } from "./scripts"

export async function MigrationRunner({
  APP_SOURCE,
  MigrationRepository
}: MigrationRunnerPayload): Promise<void> {
  const migrationRepository = new MigrationRepository(APP_SOURCE)

  const missingsMigrations = await migrationRepository.getMisssingScripts(migrationScripts)

  if (missingsMigrations.length > 0) {
    const migrationsToRun = missingsMigrations.map(migration => migration.script({
      name: migration.name,
      SOURCE: APP_SOURCE,
      QueryRunner: APP_SOURCE.createQueryRunner()
    }))

    if (APP_SOURCE.isInitialized) {
      const runnedMigrations = await Promise.all(migrationsToRun)
      const migrationsToCreate = runnedMigrations
        .filter(migration => migration.success)
        .map(migration => migration.name)

      await Promise.all(migrationsToCreate.map(name => migrationRepository.create(name)))
    }
  }
}
