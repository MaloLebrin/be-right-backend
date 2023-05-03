/* eslint-disable security/detect-object-injection */
import type { DataSource, Repository } from 'typeorm'
import { BadgeEntity } from '../../entity/repositories/Badge.entity'
import { BadgeEnumIcon, BadgeEnumLabel, BadgeNameArray } from '../../types/Badge'

export class BadgeSeeder {
  BadgeRepository: Repository<BadgeEntity>

  constructor(SEED_SOURCE: DataSource) {
    this.BadgeRepository = SEED_SOURCE.getRepository(BadgeEntity)
  }

  private async createBadges() {
    const badges = this.BadgeRepository.create(BadgeNameArray.map(name => (
      {
        name,
        label: BadgeEnumLabel[name],
        icon: BadgeEnumIcon[name],
        slug: BadgeEnumLabel[name].split(' ').join('-'),
      }
    )))

    await this.BadgeRepository.save(badges)
  }

  public async start() {
    await this.createBadges()
  }
}
