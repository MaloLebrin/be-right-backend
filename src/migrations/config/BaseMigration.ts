import { DataSource, QueryRunner, Repository } from "typeorm"
import { MigrationEntity } from "../../entity/repositories/Migration.entity"

export abstract class BaseMigration {
  name: string
  SOURCE: DataSource
  QueryRunner: QueryRunner
  MigrationRepository: Repository<MigrationEntity>

  constructor(APP_SOURCE: DataSource) {
    this.name = 'createMigrationTable1689256415633'
    if (APP_SOURCE.isInitialized) {
      this.SOURCE = APP_SOURCE
      this.QueryRunner = this.SOURCE.createQueryRunner()
      this.MigrationRepository = this.SOURCE.getRepository(MigrationEntity)
    }
  }

  public async hasAlreadyBeenRun(preCreatedVersion: number): Promise<boolean> {
    return this.MigrationRepository.exist({
      where: {
        version: preCreatedVersion,
        name: this.name
      }
    })
  }
}
