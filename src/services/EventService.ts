import AnswerEntity from "../entity/AnswerEntity"
import EventEntity from "../entity/EventEntity"
import { getManager } from "typeorm"
import AnswerService from "./AnswerService"
import { EventStatusEnum } from "../types/Event"
import { isUserEntity, updateStatusEventBasedOnStartEndTodayDate, isAnswerSigned } from "../utils/index"
export default class EventService {

  public static async updateEventSignatureNeeded(eventId: number, signatureNeeded: number) {
    const event = await getManager().findOne(EventEntity, eventId)
    event.totalSignatureNeeded = signatureNeeded
    await getManager().save(event)
    return this.getOneEvent(eventId)
  }

  public static getNumberSignatureNeededForEvent = async (eventId: number) => {
    const answers = await getManager().find(AnswerEntity, {
      where: {
        event: eventId,
      },
    })
    const totalSignatureNeeded = answers.length
    await getManager().update(EventEntity, eventId, { totalSignatureNeeded, updatedAt: new Date() })
    return this.getOneEvent(eventId)
  }

  /* TODO 
  in this operation get total answers for event and set as totalSignatureNeeded use answer service
  use this get every where
  */
  public static async getOneEvent(eventId: number): Promise<EventEntity> {
    const finded = await getManager().findOne(EventEntity, eventId, { relations: ["createdByUser", "partner"] })
    const answers = await AnswerService.getAllAnswersForEvent(finded.id)
    if (isUserEntity(finded.createdByUser) && isUserEntity(finded.partner)) {
      const user = finded.createdByUser
      const partner = finded.partner

      return {
        ...finded,
        totalSignatureNeeded: answers.length,
        createdByUser: user.id,
        partner: partner.id,
      }
    } else {
      return {
        ...finded,
        totalSignatureNeeded: answers.length,
      }
    }
  }

  public static async getManyEvents(eventIds: number[]) {
    const finded = await getManager().findByIds(EventEntity, eventIds, { relations: ["createdByUser", "partner"] })
    return Promise.all(finded.map(async (event) => {
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
    const finded = await this.getOneEvent(eventId)
    if (!finded) {
      return null
    }
    delete finded.files

    const eventToSave = {
      ...finded,
      ...event,
      updatedAt: new Date(),
    }

    await getManager().update(EventEntity, eventId, eventToSave)
    await this.multipleUpdateForEvent(eventId)
    return this.getOneEvent(eventId)
  }

  public static async createOneEvent(event: Partial<EventEntity>, userId: number) {
    event.createdByUser = userId
    const newEvent = getManager().create(EventEntity, event)
    await getManager().save(newEvent)
    return this.getOneEvent(newEvent.id)
  }

  public static async updateStatusForEvent(eventId: number) {
    const event = await this.getOneEvent(eventId)
    if (!event) {
      return null
    }
    await getManager().save(updateStatusEventBasedOnStartEndTodayDate(event))
    return this.getOneEvent(eventId)
  }

  public static async updateStatusForEventArray(events: EventEntity[]) {
    if (events.length > 0) {
      const eventsToUpdate = events.map(event => updateStatusEventBasedOnStartEndTodayDate(event))
      await getManager().save([...eventsToUpdate])
      return eventsToUpdate
    }
    return null
  }

  public static async updateStatusEventWhenCompleted(event: EventEntity) {
    if (event.totalSignatureNeeded > 0) {
      const answers = await AnswerService.getAllAnswersForEvent(event.id)
      if (answers.length > 0) {
        const signedAnswers = answers.filter(answer => isAnswerSigned(answer))
        if (signedAnswers.length === event.totalSignatureNeeded) {
          event.status = EventStatusEnum.COMPLETED
          await getManager().save(event)
        }
      }
    }
    return event
  }

  public static async multipleUpdateForEvent(eventId: number) {
    if (typeof eventId === 'number') {
      const event = await this.getOneEvent(eventId)
      await this.getNumberSignatureNeededForEvent(eventId)
      await this.updateStatusForEvent(eventId)
      if (event) {
        await this.updateStatusEventWhenCompleted(event)
      }
    }
  }
}
