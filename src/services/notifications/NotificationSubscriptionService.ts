import type { DataSource, Repository } from 'typeorm'
import { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import type { CreateNotificationSubscriptionPayload } from '../../types'

export class NotificationSubscriptionService {
  repository: Repository<NotificationSubcriptionEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(NotificationSubcriptionEntity)
  }

  public getOne = async (id: number) => {
    return this.repository.findOne({
      where: { id },
    })
  }

  public getOneByUserId = async (userId: number) => {
    return this.repository.findOne({
      where: {
        createdByUserId: userId,
      },
    })
  }

  public createOne = async (payload: CreateNotificationSubscriptionPayload) => {
    const { type, user } = payload
    const eventNotifCreated = this.repository.create({
      type,
      createdByUser: user,
    })
    await this.repository.save(eventNotifCreated)
    return eventNotifCreated
  }

  public deleteOne = async (id: number) => {
    return this.repository.softDelete(id)
  }
}
