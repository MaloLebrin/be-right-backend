import AnswerEntity from "../entity/AnswerEntity"
import EventEntity from "../entity/EventEntity"
import { getManager } from "typeorm"
import { UserEntity } from "../entity/UserEntity"
import AnswerService from "./AnswerService"

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
      relations: ["employee"],
    })
    const totalSignatureNeeded = answers.length
    await getManager().update(EventEntity, eventId, { totalSignatureNeeded, updatedAt: new Date() })
    return this.getOneEvent(eventId)
  }

  /* TODO 
  in this operation get total nswers for event and set as totalSignatureNeeded use answer service
  use this get every where
  */
  public static async getOneEvent(eventId: number): Promise<EventEntity> {
    const finded = await getManager().findOne(EventEntity, eventId, { relations: ["createdByUser", "partner"] })
    const answers = await AnswerService.getAllAnswersForEvent(finded.id)
    const user = finded.createdByUser as UserEntity
    const partner = finded.partner as UserEntity

    return {
      ...finded,
      totalSignatureNeeded: answers.length,
      createdByUser: user?.id,
      partner: partner?.id,
    }
  }

  public static async getManyEvents(eventIds: number[]) {
    const finded = await getManager().findByIds(EventEntity, eventIds, { relations: ["createdByUser", "partner"] })
    return finded.map(async (event) => {
      const user = event.createdByUser as UserEntity
      const answers = await AnswerService.getAllAnswersForEvent(event.id)
      const partner = event.partner as UserEntity

      return {
        ...event,
        totalSignatureNeeded: answers.length,
        createdByUser: user?.id,
        partner: partner?.id,
      }
    })
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
    return this.getOneEvent(eventId)
  }
}