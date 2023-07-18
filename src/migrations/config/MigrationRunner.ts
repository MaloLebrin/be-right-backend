import { MigrationRunnerPayload } from "../../types/Migrations"
import { migrationScripts } from "./scripts"

export async function MigrationRunner({
  APP_SOURCE,
  MigrationRepository
}: MigrationRunnerPayload): Promise<void> {
  const migrationRepository = new MigrationRepository(APP_SOURCE)

  const missingsMigrations = await migrationRepository.getMisssingScripts(migrationScripts)

  if (missingsMigrations.length > 0) {
    const promises = []

    missingsMigrations.forEach(script => {
      promises.push(script.script({
        name: script.name,
        SOURCE: APP_SOURCE,
        QueryRunner: APP_SOURCE.createQueryRunner()
      }))

      promises.push(migrationRepository.create(script.name, script.version))
    })

    await Promise.all(promises)
  }
}
