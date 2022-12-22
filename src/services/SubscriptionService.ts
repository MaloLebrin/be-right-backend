import dayjs from 'dayjs'
import type { EntityManager } from 'typeorm'
import { In } from 'typeorm'
import { APP_SOURCE } from '..'
import { SubscriptionEntitiy } from '../entity'
import type { SubscriptionEnum } from '../types/Subscription'

export class SubscriptionService {
  repository: EntityManager

  constructor() {
    this.repository = APP_SOURCE.manager
  }

  async createOne(subscriptionType: SubscriptionEnum, userId: number) {
    const subscription = this.repository.create(SubscriptionEntitiy, {
      type: subscriptionType,
      user: userId,
      expireAt: dayjs().add(1, 'year'), // TODO generate date with payment and  type
    })
    await this.repository.save(subscription)
    return subscription
  }

  async getOne(id: number) {
    return this.repository.findOne(SubscriptionEntitiy, {
      where: { id },
      relations: ['user', 'payment'],
    })
  }

  async getMany(ids: number[]) {
    return this.repository.find(SubscriptionEntitiy, {
      where: {
        id: In(ids),
      },
      relations: ['user', 'payment'],
    })
  }

  async getOneByUserId(userId: number) {
    return this.repository.findOne(SubscriptionEntitiy, {
      where: {
        user: userId,
      },
      relations: ['user', 'payment'],
    })
  }

  async updateOne(id: number, subscription: SubscriptionEntitiy) {
    return this.repository.update(SubscriptionEntitiy, id, subscription)
  }
}
