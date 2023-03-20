import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { CompanyEntity } from '../entity/Company.entity'
import type { SubscriptionEntity } from '../entity/SubscriptionEntity'
import type { UserEntity } from '../entity/UserEntity'
import type { SubscriptionEnum } from '../types'

export class CompanyService {
  repository: Repository<CompanyEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(CompanyEntity)
  }

  async createOne({
    name,
    subscription,
    subscriptionLabel,
    onwer,
  }: {
    name: string
    subscription: SubscriptionEntity
    subscriptionLabel: SubscriptionEnum
    onwer: UserEntity
  }) {
    const company = this.repository.create({
      name,
      subscription,
      subscriptionLabel,
      onwer,
    })
    return await this.repository.save(company)
  }

  async getOne(companyId: number, withRelations?: boolean) {
    return this.repository.findOne({
      where: {
        id: companyId,
      },
      relations: {
        onwer: withRelations,
        employees: withRelations,
        events: withRelations,
        groups: withRelations,
        files: withRelations,
        subscription: withRelations,
        address: withRelations,
        users: withRelations,
      },
    })
  }

  async getMany(companyIds: number[], withRelations?: boolean) {
    return this.repository.findOne({
      where: {
        id: In(companyIds),
      },
      relations: {
        onwer: withRelations,
        employees: withRelations,
        events: withRelations,
        groups: withRelations,
        files: withRelations,
        subscription: withRelations,
        address: withRelations,
        users: withRelations,
      },
    })
  }

  async deleteOne(id: number) {
    return this.repository.softDelete(id)
  }
}
