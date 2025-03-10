import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { noNull, notUndefined } from '@antfu/utils'
import AnswerEntity from '../../entity/AnswerEntity'
import EventEntity from '../../entity/EventEntity'
import type RedisCache from '../../RedisCache'
import { EntitiesEnum } from '../../types'
import { EventStatusEnum } from '../../types/Event'
import { generateRedisKey, removeUnecessaryFieldsEvent, updateStatusEventBasedOnStartEndTodayDate } from '../../utils/index'
import { ApiError } from '../../middlewares/ApiError'
import { AddressService } from '../AddressService'
import AnswerService from '../AnswerService'
import { REDIS_CACHE } from '../..'

export class EventService {
  private repository: Repository<EventEntity>
  private AnswerRepository: Repository<AnswerEntity>
  private answerService: AnswerService
  private addressService: AddressService
  private redisCache: RedisCache

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(EventEntity)
    this.AnswerRepository = APP_SOURCE.getRepository(AnswerEntity)
    this.answerService = new AnswerService(APP_SOURCE)
    this.addressService = new AddressService(APP_SOURCE)
    this.redisCache = REDIS_CACHE
  }

  public saveEventRedisCache = async (event: EventEntity) => {
    await this.redisCache.save(generateRedisKey({
      typeofEntity: EntitiesEnum.EVENT,
      field: 'id',
      id: event.id,
    }), event)
  }

  async getOneEvent(eventId: number): Promise<EventEntity> {
    return this.repository.findOne({
      where: {
        id: eventId,
      },
      relations: ['partner', 'address'],
    })
  }

  async getOneWithoutRelations(eventId: number) {
    return this.repository.findOne({ where: { id: eventId } })
  }

  async getManyEvents(eventIds: number[], withRelations?: boolean) {
    return await this.repository.find({
      where: {
        id: In(eventIds),
      },
      relations: {
        company: withRelations,
        partner: withRelations,
        address: withRelations,
        files: withRelations,
      },
      order: {
        start: 'DESC',
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
    const eventSaved = await this.getOneEvent(eventId)
    await this.saveEventRedisCache(eventSaved)
    return eventSaved
  }

  async createOneEvent(event: Partial<EventEntity>, companyId: number, photographerId?: number) {
    const newEvent = this.repository.create({
      ...event,
      partner: {
        id: photographerId,
      },
      company: {
        id: companyId,
      },
    })
    await Promise.all([
      this.repository.save(newEvent),
      this.saveEventRedisCache(newEvent),
    ])
    return newEvent
  }

  /**
   * @description update event status in Database based on his answers and his dates (start, end)
   * @param eventId
   * @return previous and new status
   */
  public async updateEventStatus(eventId: number) {
    const [event, answers] = await Promise.all([
      this.getOneWithoutRelations(eventId),
      this.AnswerRepository.find({
        where: {
          event: {
            id: eventId,
          },
        },
      }),
    ])

    if (!event) {
      throw new ApiError(500, `Événément avec l'identifiant ${eventId} non trouvé`)
    }

    const initialStatus = event.status

    const isEventCompleted = answers.every(answer => noNull(answer.signedAt) && notUndefined(answer.signedAt)) && answers.length > 0

    let newStatus: EventStatusEnum | null = null

    if (isEventCompleted) {
      await this.repository.update(eventId, {
        totalSignatureNeeded: answers.length,
        signatureCount: answers.length,
        status: EventStatusEnum.COMPLETED,
      })

      newStatus = EventStatusEnum.COMPLETED
    } else {
      newStatus = updateStatusEventBasedOnStartEndTodayDate(event)
      await this.repository.update(eventId, {
        totalSignatureNeeded: answers.length,
        signatureCount: answers.filter(answer => noNull(answer.signedAt) && notUndefined(answer.signedAt)).length,
        status: newStatus,
      })
    }

    const eventUpdated = await this.getOneWithoutRelations(eventId)

    await this.saveEventRedisCache(eventUpdated)

    return {
      initialStatus,
      newStatus,
      event: eventUpdated,
    }
  }
}
