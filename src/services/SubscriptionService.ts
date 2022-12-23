import dayjs from 'dayjs'
import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { SubscriptionEntity } from '../entity/SubscriptionEntity'
import type { SubscriptionEnum } from '../types/Subscription'

export class SubscriptionService {
  repository: Repository<SubscriptionEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(SubscriptionEntity)
  }

  async createOne(subscriptionType: SubscriptionEnum) {
    const subscription = this.repository.create({
      type: subscriptionType,
      expireAt: dayjs().add(1, 'year'), // TODO generate date with payment and  type
    })
    await this.repository.save(subscription)
    return subscription
  }

  async getOne(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'payment'],
    })
  }

  async getMany(ids: number[]) {
    return this.repository.find({
      where: {
        id: In(ids),
      },
      relations: ['user', 'payment'],
    })
  }

  async updateOne(id: number, subscription: SubscriptionEntity) {
    return this.repository.update(id, subscription)
  }
}
