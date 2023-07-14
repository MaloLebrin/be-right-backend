import type { DataSource, QueryRunner, Repository } from 'typeorm'
import type { MigrationEntity } from '../entity/repositories/Migration.entity'

export interface MigrationCustomInterface {
  name: string
  SOURCE: DataSource
  MigrationRepository: Repository<MigrationEntity>
  QueryRunner: QueryRunner
  create(): Promise<void>
  delete(name: string): Promise<void>
}
