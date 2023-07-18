import { DataSource, In, MoreThan, Repository } from "typeorm"
import { MigrationEntity } from "../../entity/repositories/Migration.entity"
import { MigrationScript } from "../../types/Migrations"

export class MigrationRepository {
  MigrationRepository: Repository<MigrationEntity>

  constructor(APP_SOURCE: DataSource) {
    if (APP_SOURCE.isInitialized) {
      this.MigrationRepository = APP_SOURCE.getRepository(MigrationEntity)
    }
  }

  getMisssingScripts = async (scripts: MigrationScript[]): Promise<MigrationScript[]> => {
    const existingScripts = await this.MigrationRepository.find({
      where: {
        version: In(scripts.map(script => script.version)),
        name: In(scripts.map(script => script.name)),
      }
    })

    const existingVersions = existingScripts.map(script => script.version)
    const existingNames = existingScripts.map(script => script.name)

    return scripts.filter(script =>
      !existingVersions.includes(script.version) && !existingNames.includes(script.name))
  }

  private findLastCreated = async (): Promise<MigrationEntity> => {
    return this.MigrationRepository.findOne({
      where: {
        id: MoreThan(0),
      },
      order: {
        id: 'DESC'
      }
    })
  }

  create = async (name: string): Promise<void> => {
    const lastestMigration = await this.findLastCreated()
    const newMigration = this.MigrationRepository.create({
      name,
      version: lastestMigration ? lastestMigration.version + 1 : 0,
    })
    await this.MigrationRepository.save(newMigration)
  }

  delete = async (name: string, version: number): Promise<void> => {
    await this.MigrationRepository.delete({ name, version })
  }
}
