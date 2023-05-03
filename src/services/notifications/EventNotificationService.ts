import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import type AnswerEntity from '../../entity/AnswerEntity'
import { EventNotificationEntity } from '../../entity/bases/EventNotification.entity'
import type EventEntity from '../../entity/EventEntity'
import type { NotificationTypeEnum } from '../../types'
import type { EmployeeEntity } from '../../entity/employees/EmployeeEntity'

export class EventNotificationService {
  repository: Repository<EventNotificationEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(EventNotificationEntity)
  }

  public getOne = async (id: number, withRelations?: boolean) => {
    return this.repository.findOne({
      where: { id },
      relations: {
        notifications: withRelations,
        event: withRelations,
        answer: withRelations,
      },
    })
  }

  public getMany = async (ids: number[], withRelations?: boolean) => {
    return this.repository.find({
      where: { id: In(ids) },
      relations: {
        notifications: withRelations,
        event: withRelations,
        answer: withRelations,
      },
    })
  }

  public createOne = async ({
    name,
    event,
    answer,
    employee,
  }: {
    name: NotificationTypeEnum
    event?: EventEntity
    answer?: AnswerEntity
    employee?: EmployeeEntity
  }) => {
    const eventNotifCreated = this.repository.create({
      name,
      event: event || null,
      answer: answer || null,
      employee: employee || null,
    })
    await this.repository.save(eventNotifCreated)
    return eventNotifCreated
  }

  public deleteOne = async (id: number) => {
    return this.repository.softDelete(id)
  }
}
