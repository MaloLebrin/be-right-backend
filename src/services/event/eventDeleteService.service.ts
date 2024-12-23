import { type DataSource, type Repository } from 'typeorm'
import EventEntity from '../../entity/EventEntity'
import { AddressEntity } from '../../entity/AddressEntity'
import AnswerEntity from '../../entity/AnswerEntity'
import { REDIS_CACHE } from '../..'
import type RedisCache from '../../RedisCache'
import { EntitiesEnum } from '../../types/RedisTypes'
import { generateRedisKey } from '../../utils/redisHelper'
import AnswerService from '../AnswerService'
import { EventStatusEnum } from '../../types'
import { MailEntity } from '../../entity/MailEntity'
import { DraftEventEntity } from '../../entity/event/DraftEvent.entity'

export class EventDeleteService {
  private repository: Repository<EventEntity>
  private AnswerRepository: Repository<AnswerEntity>
  private AddressRepository: Repository<AddressEntity>
  private MailsRepository: Repository<MailEntity>
  private DraftEventRepository: Repository<DraftEventEntity>
  private answerService: AnswerService
  private redisCache: RedisCache

  constructor(APP_SOURCE: DataSource) {
    if (APP_SOURCE) {
      this.repository = APP_SOURCE.getRepository(EventEntity)
      this.MailsRepository = APP_SOURCE.getRepository(MailEntity)
      this.AnswerRepository = APP_SOURCE.getRepository(AnswerEntity)
      this.AddressRepository = APP_SOURCE.getRepository(AddressEntity)
      this.DraftEventRepository = APP_SOURCE.getRepository(DraftEventEntity)
      this.redisCache = REDIS_CACHE
      this.answerService = new AnswerService(APP_SOURCE)
    }
  }

  async deleteOneAndRelationsForEver(event: EventEntity) {
    await this.DraftEventRepository.delete({
      event: {
        id: event.id,
      },
    })
    if (event.addressId) {
      await this.AddressRepository.delete(event.addressId)

      await this.redisCache.invalidate(generateRedisKey({
        typeofEntity: EntitiesEnum.ADDRESS,
        field: 'id',
        id: event.addressId,
      }))
    }

    const answers = await this.AnswerRepository.find({
      select: {
        id: true,
      },
      where: {
        event: {
          id: event.id,
        },
      },
      relations: ['mails'],
      withDeleted: true,
    })

    const answersIds = answers.map(answer => answer.id)

    if (answersIds?.length > 0) {
      const mailIds = answers.reduce((acc, answer) => [...acc, ...answer.mails.map(mail => mail.id)], [])

      await this.MailsRepository.delete(mailIds)
      await this.AnswerRepository.delete(answersIds)

      await Promise.all(answersIds.map(async id => {
        await this.redisCache.invalidate(generateRedisKey({
          typeofEntity: EntitiesEnum.ANSWER,
          field: 'id',
          id,
        }))
      }))
    }

    await this.repository.update(event.id, {
      status: EventStatusEnum.CLOSED,
    })

    await Promise.all([
      this.repository.delete(event.id),
      this.redisCache.invalidate(generateRedisKey({
        typeofEntity: EntitiesEnum.EVENT,
        field: 'id',
        id: event.id,
      }))],
    )
  }

  async softDeleteOneAndRelations(event: EventEntity) {
    if (event.addressId) {
      await this.AddressRepository.softDelete(event.addressId)

      await this.redisCache.invalidate(generateRedisKey({
        typeofEntity: EntitiesEnum.ADDRESS,
        field: 'id',
        id: event.addressId,
      }))
    }

    const answersIds = await this.answerService.getAnswerIdsForEvent(event.id)

    if (answersIds?.length > 0) {
      await this.AnswerRepository.softDelete(answersIds)

      await Promise.all(answersIds.map(async id => {
        await this.redisCache.invalidate(generateRedisKey({
          typeofEntity: EntitiesEnum.ANSWER,
          field: 'id',
          id,
        }))
      }))
    }

    await this.repository.update(event.id, {
      status: EventStatusEnum.CLOSED,
    })

    await Promise.all([
      this.repository.softDelete(event.id),
      this.redisCache.invalidate(generateRedisKey({
        typeofEntity: EntitiesEnum.EVENT,
        field: 'id',
        id: event.id,
      }))],
    )
  }
}
