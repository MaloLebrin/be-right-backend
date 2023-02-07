import type { DataSource, EntityManager, Repository } from 'typeorm'
import { In } from 'typeorm'
import { REDIS_CACHE } from '..'
import AnswerEntity from '../entity/AnswerEntity'
import EventEntity from '../entity/EventEntity'
import type RedisCache from '../RedisCache'
import { EntitiesEnum } from '../types'
import { EventStatusEnum } from '../types/Event'
import { generateRedisKey, isAnswerSigned, removeUnecessaryFieldsEvent, updateStatusEventBasedOnStartEndTodayDate } from '../utils/index'
import { AddressService } from './AddressService'
import AnswerService from './AnswerService'

export default class EventService {
  getManager: EntityManager

  repository: Repository<EventEntity>

  answerService: AnswerService

  addressService: AddressService

  redisCache: RedisCache

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(EventEntity)
    this.getManager = APP_SOURCE.manager
    this.answerService = new AnswerService(APP_SOURCE)
    this.addressService = new AddressService(APP_SOURCE)
    this.redisCache = REDIS_CACHE
  }

  async deleteOneAndRelations(event: EventEntity) {
    if (event.addressId) {
      await this.addressService.softDelete(event.addressId)

      await this.redisCache.invalidate(generateRedisKey({
        typeofEntity: EntitiesEnum.ADDRESS,
        field: 'id',
        id: event.addressId,
      }))
    }

    const answersIds = await this.answerService.getAnswerIdsForEvent(event.id)

    if (answersIds?.length > 0) {
      await this.answerService.deleteMany(answersIds)

      answersIds.forEach(async id => {
        await this.redisCache.invalidate(generateRedisKey({
          typeofEntity: EntitiesEnum.ANSWER,
          field: 'id',
          id,
        }))
      })
    }

    await this.repository.softDelete(event.id)
    await this.redisCache.invalidate(generateRedisKey({
      typeofEntity: EntitiesEnum.EVENT,
      field: 'id',
      id: event.id,
    }))
  }

  async updateEventSignatureNeeded(eventId: number, signatureNeeded: number) {
    await this.repository.update(eventId, {
      updatedAt: new Date(),
      totalSignatureNeeded: signatureNeeded,
    })
    return this.getOneWithoutRelations(eventId)
  }

  async getNumberSignatureNeededForEvent(id: number) {
    const answers = await this.getManager.find(AnswerEntity, {
      where: {
        event: { id },
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
  async getOneEvent(eventId: number): Promise<EventEntity> {
    return this.repository.findOne({
      where: {
        id: eventId,
      },
      relations: ['createdByUser', 'partner', 'address'],
    })
  }

  async getOneWithoutRelations(eventId: number) {
    return this.repository.findOne({ where: { id: eventId } })
  }

  async getManyEvents(eventIds: number[], withRelations?: boolean) {
    if (withRelations) {
      return await this.repository.find({
        where: {
          id: In(eventIds),
        },
        relations: ['createdByUser', 'partner', 'address', 'files'],
      })
    }

    return this.repository.find({
      where: {
        id: In(eventIds),
      },
    })
  }

  async updateOneEvent(eventId: number, event: EventEntity) {
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

  async createOneEvent(event: Partial<EventEntity>, userId: number, photographerId?: number) {
    if (photographerId) {
      event.partnerId = photographerId
    }
    event.createdByUserId = userId
    const newEvent = this.repository.create(event)
    await this.repository.save(newEvent)
    return newEvent
  }

  async updateStatusForEvent(id: number) {
    const event = await this.getOneWithoutRelations(id)
    if (!event) {
      return null
    }

    await this.repository.update(id, {
      status: updateStatusEventBasedOnStartEndTodayDate(event),
    })
  }

  async updateStatusForEventArray(events: EventEntity[]) {
    if (events.length > 0) {
      events.forEach(event => this.updateStatusForEvent(event.id))
    }
  }

  async updateStatusEventWhenCompleted(event: EventEntity) {
    if (event.totalSignatureNeeded > 0) {
      const answers = await this.answerService.getAllAnswersForEvent(event.id)
      if (answers.length > 0) {
        const signedAnswers = answers.filter(answer => isAnswerSigned(answer))
        if (signedAnswers.length === event.totalSignatureNeeded) {
          await this.repository.update(event.id, { status: EventStatusEnum.COMPLETED })
        }
      }
    }
    return event
  }

  async multipleUpdateForEvent(eventId: number) {
    if (typeof eventId === 'number') {
      await this.getNumberSignatureNeededForEvent(eventId)
      await this.updateStatusForEvent(eventId)
      const event = await this.getOneWithoutRelations(eventId)
      if (event) {
        await this.updateStatusEventWhenCompleted(event)
      }
    }
  }
}
