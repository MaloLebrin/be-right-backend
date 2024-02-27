import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { EventNotificationEntity } from '../../entity/bases/EventNotification.entity'
import { NotificationEntity } from '../../entity/notifications/Notification.entity'
import type { NotificationSubcriptionEntity } from '../../entity/notifications/NotificationSubscription.entity'
import type { NotificationTypeEnum } from '../../types'
import AnswerEntity from '../../entity/AnswerEntity'
import { getfullUsername } from '../../utils/userHelper'

export class NotificationService {
  private repository: Repository<NotificationEntity>
  private eventNotifRepository: Repository<EventNotificationEntity>
  private AnswerRepository: Repository<AnswerEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(NotificationEntity)
    this.eventNotifRepository = APP_SOURCE.getRepository(EventNotificationEntity)
    this.AnswerRepository = APP_SOURCE.getRepository(AnswerEntity)
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
    eventNotificationId,
  }: {
    type: NotificationTypeEnum
    subscriber: NotificationSubcriptionEntity
    eventNotificationId: number
  }) => {
    let title: string | null = null
    let description: string | null = null

    const eventNotif = await this.eventNotifRepository.findOne({
      where: {
        id: eventNotificationId,
      },
      relations: {
        answer: true,
        event: true,
        employee: true,
      },
    })

    if (eventNotif.employee) {
      title = `Destinataire ${getfullUsername(eventNotif.employee)} créé`
    }

    else if (eventNotif.event) {
      title = `Événement ${eventNotif.event.name} créé`
    }

    else if (eventNotif.answer) {
      const answer = await this.AnswerRepository.findOne({
        where: {
          id: eventNotif.answer.id,
        },
        relations: {
          event: true,
          employee: true,
        },
      })
      description = `Destinataire ${getfullUsername(answer.employee)} a répondu à l'événement ${answer.event.name} en ${answer.hasSigned ? 'acceptant' : 'refusant'}`
      title = `Réponse ${answer.hasSigned ? 'acceptée' : 'refusée'} ${answer.event.name}`
    }

    const notification = this.repository.create({
      type,
      subscriber,
      eventNotification: eventNotif,
      title,
      description,
    })
    await this.repository.save(notification)
    return notification
  }

  public createMany = async (payload: {
    type: NotificationTypeEnum
    subscriber: NotificationSubcriptionEntity
    eventNotificationId: number
  }[]) => {
    const eventNotifications = await this.eventNotifRepository.find({
      where: {
        id: In(payload.map(({ eventNotificationId }) => eventNotificationId)),
      },
      relations: {
        answer: true,
        event: true,
        employee: true,
      },
    })

    const eventWithAnswer = eventNotifications.map(en => en.answer?.id).filter(Boolean)

    const answers = await this.AnswerRepository.find({
      where: {
        id: In(eventWithAnswer),
      },
      relations: {
        event: true,
        employee: true,
      },
    })

    const notificationsToCreate = payload.map(({ type, subscriber, eventNotificationId }) => {
      let title: string | null = null
      let description: string | null = null

      const eventNotif = eventNotifications.find(en => en.id === eventNotificationId)

      if (eventNotif.employee) {
        title = `Destinataire ${getfullUsername(eventNotif.employee)} créé`
      }

      else if (eventNotif.event) {
        title = `Événement ${eventNotif.event.name} créé`
      }

      else if (eventNotif.answer) {
        const answer = answers.find(answer => answer.id === eventNotif.answer.id)
        description = `Destinataire ${getfullUsername(answer.employee)} a répondu à l'événement ${answer.event.name} en ${answer.hasSigned ? 'acceptant' : 'refusant'}`
        title = `Réponse ${answer.hasSigned ? 'acceptée' : 'refusée'} ${answer.event.name}`
      }

      return {
        type,
        subscriber,
        eventNotification: eventNotif,
        title,
        description,
      }
    })

    const notifications = this.repository.create(notificationsToCreate)
    await this.repository.save(notifications)
    return notifications
  }

  public deleteOne = async (id: number) => {
    return this.repository.softDelete(id)
  }
}
