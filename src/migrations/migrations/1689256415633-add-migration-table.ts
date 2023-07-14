import { DataSource } from "typeorm"
import { MigrationCustomInterface } from "../../types/Migrations"
import { BaseMigration } from "../config/BaseMigration"

export class createMigrationTable1689256415633 extends BaseMigration implements MigrationCustomInterface {
  constructor(APP_SOURCE: DataSource) {
    super(APP_SOURCE)
  }

  async create() {
    const newMigration = this.MigrationRepository.create({
      name: 'test',
      version: 0,
    })

    const hasAlreadyBeenRun = await this.hasAlreadyBeenRun(newMigration.version)
    if (!hasAlreadyBeenRun) {
      await this.up()
      await this.MigrationRepository.save(newMigration)
    }
  }

  async delete(name: string) {
    await this.MigrationRepository.delete({ name })
  }

  public async up(): Promise<void> {
    console.info('Create new table migration')
  }

  public async down(): Promise<void> {
    console.info('Delete new table migration')
    await this.delete(this.name)
  }
}
