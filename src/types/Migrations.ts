import type { DataSource, QueryRunner } from 'typeorm'
import type { MigrationRepository } from '../migrations/config/MigrationRepository'

export interface MigrationCustomInterface {
  name: string
  SOURCE: DataSource
  QueryRunner: QueryRunner
}

export interface MigrationScript {
  version: number
  name: string
  script: ({ name, SOURCE, QueryRunner }: MigrationCustomInterface) => Promise<void>
}

export interface MigrationRunnerPayload {
  APP_SOURCE: DataSource
  MigrationRepository: typeof MigrationRepository
}
