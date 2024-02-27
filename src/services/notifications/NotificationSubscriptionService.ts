import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import type { UserEntity } from '../../entity/UserEntity'
import type { CreateNotificationSubscriptionPayload, NotificationTypeEnum } from '../../types'

export class NotificationSubscriptionService {
  private repository: Repository<NotificationSubcriptionEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(NotificationSubcriptionEntity)
  }

  public getOne = async (id: number, withRelations?: boolean) => {
    return this.repository.findOne({
      where: { id },
      relations: {
        notifications: withRelations,
        createdByUser: withRelations,
      },
    })
  }

  public getMany = async (ids: number[], withRelations?: boolean) => {
    return this.repository.find({
      where: { id: In(ids) },
      relations: {
        notifications: withRelations,
        createdByUser: withRelations,
      },
    })
  }

  public getOneByUser = async (user: UserEntity, withRelations?: boolean) => {
    return await this.repository.find({
      where: {
        createdByUser: {
          id: user.id,
        },
      },
      relations: {
        notifications: {
          eventNotification: withRelations,
        },
        createdByUser: withRelations,
      },
    })
  }

  public getOneByUserAndType = async ({
    userId,
    type,
    withRelations,
  }: {
    userId: number
    type: NotificationTypeEnum
    withRelations?: boolean
  }) => {
    return this.repository.findOne({
      where: {
        createdByUser: {
          id: userId,
        },
        type,
      },
      relations: {
        notifications: withRelations,
        createdByUser: withRelations,
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
