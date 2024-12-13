import dayjs from 'dayjs'
import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { SubscriptionEntity } from '../entity/SubscriptionEntity'
import { SubscriptionEnum } from '../types/Subscription'
import { CompanyEntity } from '../entity/Company.entity'

export class SubscriptionService {
  private repository: Repository<SubscriptionEntity>
  private QueryBuilderCompany: Repository<CompanyEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(SubscriptionEntity)
    this.QueryBuilderCompany = APP_SOURCE.getRepository(CompanyEntity)
  }

  public createOne = async (subscriptionType: SubscriptionEnum) => {
    const subscription = this.repository.create({
      type: subscriptionType,
      expireAt: dayjs().add(1, 'year'), // TODO generate date with payment and  type
    })
    await this.repository.save(subscription)
    return subscription
  }

  public createBasicSubscription = async () => {
    const subscription = this.repository.create({
      type: SubscriptionEnum.BASIC,
      expireAt: dayjs().add(1, 'year'), // TODO generate date with payment and  type
    })
    await this.repository.save(subscription)
    return subscription
  }

  public getOne = async (id: number) => {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'payment'],
    })
  }

  public getOneByCompanyId = async (companyId: number) => {
    const company = await this.QueryBuilderCompany.findOneOrFail({
      where: { id: companyId },
      relations: ['subscription'],
    })
    return company?.subscription || null
  }

  public getMany = async (ids: number[]) => {
    return this.repository.find({
      where: {
        id: In(ids),
      },
      relations: ['user', 'payment'],
    })
  }

  public updateOne = async (id: number, subscription: SubscriptionEntity) => {
    return this.repository.update(id, subscription)
  }

  public updateSubscription = async (id: number, subscriptionType: SubscriptionEnum) => {
    return this.repository.update(id, { type: subscriptionType })
  }

  public deleteOne = async (id: number) => {
    return this.repository.softDelete(id)
  }
}
