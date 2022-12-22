import dayjs from 'dayjs'
import { In } from 'typeorm'
import { APP_SOURCE } from '..'
import { SubscriptionEntitiy } from '../entity'
import type { SubscriptionEnum } from '../types/Subscription'

export class SubscriptionService {
  static repository = APP_SOURCE.getRepository(SubscriptionEntitiy)

  public static async createOne(subscriptionType: SubscriptionEnum, userId: number) {
    const subscription = this.repository.create({
      type: subscriptionType,
      user: userId,
      expireAt: dayjs().add(1, 'year'), // TODO generate date with payment and  type
    })
    await this.repository.save(subscription)
    return subscription
  }

  public static async getOne(id: number) {
    return this.repository.findOne({
      where: { id },
      relations: ['user', 'payment'],
    })
  }

  public static async getMany(ids: number[]) {
    return this.repository.find({
      where: {
        id: In(ids),
      },
      relations: ['user', 'payment'],
    })
  }

  public static async getOneByUserId(userId: number) {
    return this.repository.findOne({
      where: {
        user: userId,
      },
      relations: ['user', 'payment'],
    })
  }

  public static async updateOne(id: number, subscription: SubscriptionEntitiy) {
    return this.repository.update(id, subscription)
  }
}
