import { SubscriptionEntitiy } from "../entity"
import { SubscriptionEnum } from "../types/Subscription"
import { getManager } from "typeorm"

export class SubscriptionService {
  public createOne = async (subscriptionType: SubscriptionEnum, userId: number) => {
    const subscription = getManager().create(SubscriptionEntitiy, {
      type: subscriptionType,
      user: userId,
      expireAt: new Date(), // TODO generate date with payment and  type
    })
    return subscription
  }

  public getOne = async (id: number) => {
    return getManager().findOne(SubscriptionEntitiy, id, { relations: ["user", "payment"] })
  }

  public getMany = async (ids: number[]) => {
    return getManager().findByIds(SubscriptionEntitiy, ids, { relations: ["user", "payment"] })
  }

  public getOneByUserId = async (userId: number) => {
    return getManager().findOne(SubscriptionEntitiy, { user: userId }, { relations: ["payment"] })
  }

  public updateOne = async (id: number, subscription: SubscriptionEntitiy) => {
    return getManager().update(SubscriptionEntitiy, id, subscription)
  }
}