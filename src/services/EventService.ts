import { In } from 'typeorm'
import { APP_SOURCE } from '..'
import AnswerEntity from '../entity/AnswerEntity'
import EventEntity from '../entity/EventEntity'
import { EventStatusEnum } from '../types/Event'
import { isAnswerSigned, isUserEntity, removeUnecessaryFieldsEvent, updateStatusEventBasedOnStartEndTodayDate } from '../utils/index'
import AnswerService from './AnswerService'

export default class EventService {
  static getManager = APP_SOURCE.manager

  static repository = APP_SOURCE.getRepository(EventEntity)

  public static async updateEventSignatureNeeded(eventId: number, signatureNeeded: number) {
    await this.repository.update(eventId, {
      updatedAt: new Date(),
      totalSignatureNeeded: signatureNeeded,
    })
    return this.getOneWithoutRelations(eventId)
  }

  public static getNumberSignatureNeededForEvent = async (id: number) => {
    const answers = await this.getManager.find(AnswerEntity, {
      where: {
        event: id,
      },
    })
    await this.repository.update(id, {
      updatedAt: new Date(),
      totalSignatureNeeded: answers.length,
    })
    return this.getOneWithoutRelations(id)
  }

  /* TODO
  in this operation get total answers for event and set as totalSignatureNeeded use answer service
  use this get every where
  */
  public static async getOneEvent(eventId: number): Promise<EventEntity> {
    const finded = await this.repository.findOne({
      where: {
        id: eventId,
      },
      relations: ['createdByUser', 'partner', 'address'],
    })

    const answers = await AnswerService.getAllAnswersForEvent(finded.id)

    if (isUserEntity(finded.createdByUser) && isUserEntity(finded.partner)) {
      const user = finded.createdByUser
      const partner = finded.partnerId

      return {
        ...finded,
        totalSignatureNeeded: answers.length,
        createdByUser: user.id,
        partnerId: partner,
      }
    } else {
      return {
        ...finded,
        totalSignatureNeeded: answers.length,
      }
    }
  }

  public static async getOneWithoutRelations(eventId: number) {
    return this.repository.findOne({ where: { id: eventId } })
  }

  public static async getManyEvents(eventIds: number[]) {
    const finded = await this.repository.find({
      where: {
        id: In(eventIds),
      },
      relations: ['createdByUser', 'partner'],
    })

    return Promise.all(finded.map(async event => {
      if (isUserEntity(event.createdByUser) && isUserEntity(event.partner)) {
        const user = event.createdByUser
        const partner = event.partner
        const answers = await AnswerService.getAllAnswersForEvent(event.id)

        return {
          ...event,
          totalSignatureNeeded: answers.length,
          createdByUser: user?.id,
          partner: partner?.id,
        }
      }
    }))
  }

  public static async updateOneEvent(eventId: number, event: EventEntity) {
    const finded = await this.getOneWithoutRelations(eventId)
    if (!finded) {
      return null
    }
    const eventToSave = {
      ...finded,
      ...event,
      updatedAt: new Date(),
    }
    await this.repository.update(eventId, removeUnecessaryFieldsEvent(eventToSave))
    await this.multipleUpdateForEvent(eventId)
    return this.getOneEvent(eventId)
  }

  public static async createOneEvent(event: Partial<EventEntity>, userId: number, photographerId?: number) {
    if (photographerId) {
      event.partnerId = photographerId
    }
    event.createdByUser = userId
    const newEvent = this.repository.create(event)
    await this.repository.save(newEvent)
    return newEvent
  }

  public static async updateStatusForEvent(eventId: number) {
    const event = await this.getOneWithoutRelations(eventId)
    if (!event) {
      return null
    }
    const eventToUpdate = updateStatusEventBasedOnStartEndTodayDate(event)
    await this.repository.update(eventId, removeUnecessaryFieldsEvent(eventToUpdate))
  }

  public static async updateStatusForEventArray(events: EventEntity[]) {
    if (events.length > 0) {
      events.forEach(event => this.updateStatusForEvent(event.id))
    }
  }

  public static async updateStatusEventWhenCompleted(event: EventEntity) {
    if (event.totalSignatureNeeded > 0) {
      const answers = await AnswerService.getAllAnswersForEvent(event.id)
      if (answers.length > 0) {
        const signedAnswers = answers.filter(answer => isAnswerSigned(answer))
        if (signedAnswers.length === event.totalSignatureNeeded) {
          await this.repository.update(event.id, { status: EventStatusEnum.COMPLETED })
        }
      }
    }
    return event
  }

  public static async multipleUpdateForEvent(eventId: number) {
    if (typeof eventId === 'number') {
      await this.getNumberSignatureNeededForEvent(eventId)
      await this.updateStatusForEvent(eventId)
      const event = await this.getOneWithoutRelations(eventId)
      if (event) {
        await this.updateStatusEventWhenCompleted(removeUnecessaryFieldsEvent(event))
      }
    }
  }
}
