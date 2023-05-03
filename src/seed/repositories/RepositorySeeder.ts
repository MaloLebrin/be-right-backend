import type { DataSource } from 'typeorm'
import { BadgeSeeder } from './BadgeSeeder'

export class RepositorySeeder {
  BadgeSeeder: BadgeSeeder
  constructor(SEED_SOURCE: DataSource) {
    this.BadgeSeeder = new BadgeSeeder(SEED_SOURCE)
  }

  public async startRepositoriesSeeders() {
    await this.BadgeSeeder.start()
  }
}
