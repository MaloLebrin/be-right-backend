import dayjs from 'dayjs'
import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { SubscriptionEntity } from '../entity/SubscriptionEntity'
import { SubscriptionEnum } from '../types/Subscription'

export class SubscriptionService {
  repository: Repository<SubscriptionEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(SubscriptionEntity)
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
    })
    await this.repository.save(subscription)
    return subscription
  }

  public getOne = async (id: number) => {
    return this.repository.findOne({
      where: { id },
    })
  }

  public getMany = async (ids: number[]) => {
    return this.repository.find({
      where: {
        id: In(ids),
      },
    })
  }

  public updateOne = async (id: number, subscription: Partial<SubscriptionEntity>) => {
    return this.repository.update(id, subscription)
  }

  public updateSubscription = async (id: number, subscriptionType: SubscriptionEnum) => {
    return this.repository.update(id, { type: subscriptionType })
  }

  public deleteOne = async (id: number) => {
    return this.repository.softDelete(id)
  }
}
