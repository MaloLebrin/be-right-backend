import { SubscriptionEntitiy } from "../entity"
import { SubscriptionEnum, SubscriptionWithRelations } from "../types/Subscription"
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

  public getOne = async (id: number): Promise<SubscriptionWithRelations> => {
    return getManager().findOne(SubscriptionEntitiy, id, { relations: ["user", "payment"] }) as unknown as SubscriptionWithRelations
  }

  public getMany = async (ids: number[]): Promise<SubscriptionWithRelations[]> => {
    return getManager().findByIds(SubscriptionEntitiy, ids, { relations: ["user", "payment"] }) as unknown as SubscriptionWithRelations[]
  }

  public getOneByUserId = async (userId: number) => {
    return getManager().findOne(SubscriptionEntitiy, { user: userId }, { relations: ["payment"] })
  }

  public updateOne = async (id: number, subscription: SubscriptionEntitiy) => {
    return getManager().update(SubscriptionEntitiy, id, subscription)
  }

}
