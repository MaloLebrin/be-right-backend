import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import type { EventNotificationEntity } from '../../entity/bases/EventNotification.entity'
import { NotificationEntity } from '../../entity/notifications/Notification.entity'
import type { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import type { NotificationTypeEnum } from '../../types'

export class NotificationService {
  repository: Repository<NotificationEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(NotificationEntity)
  }

  public getOne = async (id: number, withRelations?: boolean) => {
    return this.repository.findOne({
      where: { id },
      relations: {
        subscriber: withRelations,
        eventNotification: withRelations,
      },
    })
  }

  public getMany = async (ids: number[], withRelations?: boolean) => {
    return this.repository.find({
      where: { id: In(ids) },
      relations: {
        subscriber: withRelations,
        eventNotification: withRelations,
      },
    })
  }

  public getManyForUser = async (ids: number[], userId: number, withRelations?: boolean) => {
    return this.repository.find({
      where: {
        id: In(ids),
        subscriber: {
          createdByUser: {
            id: userId,
          },
        },
      },
      relations: {
        eventNotification: withRelations,
      },
    })
  }

  public getBySubscriberId = async (subscriberId: number) => {
    return this.repository.find({
      where: {
        subscriber: {
          id: subscriberId,
        },
      },
    })
  }

  public readNotification = async (id: number) => {
    await this.repository.update(id, { readAt: new Date() })
    return this.repository.findOne({ where: { id } })
  }

  public createOne = async ({
    type,
    subscriber,
    eventNotification,
  }: {
    type: NotificationTypeEnum
    subscriber: NotificationSubcriptionEntity
    eventNotification: EventNotificationEntity
  }) => {
    const eventNotifCreated = this.repository.create({
      type,
      subscriber,
      eventNotification,
    })
    await this.repository.save(eventNotifCreated)
    return eventNotifCreated
  }

  public deleteOne = async (id: number) => {
    return this.repository.softDelete(id)
  }
}
