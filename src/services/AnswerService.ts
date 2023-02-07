import type { DataSource, EntityManager, Repository } from 'typeorm'
import { In } from 'typeorm'
import AnswerEntity from '../entity/AnswerEntity'
import EventEntity from '../entity/EventEntity'

export default class AnswerService {
  getManager: EntityManager

  repository: Repository<AnswerEntity>
  eventRepository: Repository<EventEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(AnswerEntity)
    this.eventRepository = APP_SOURCE.getRepository(EventEntity)
    this.getManager = APP_SOURCE.manager
  }

  public createOne = async (eventId: number, employeeId: number) => {
    const event = await this.eventRepository.findOne({
      where: {
        id: eventId,
      },
    })

    const newAnswer = this.repository.create({
      event,
      employee: employeeId,
    })
    await this.repository.save(newAnswer)
    return newAnswer
  }

  public createMany = async (eventId: number, employeeIds: number[]) => {
    return Promise.all(employeeIds.map(employeeId => this.createOne(eventId, employeeId)))
  }

  public getOneAnswerForEventEmployee = async (
    { eventId, employeeId, withRelation }: { eventId: number; employeeId: number; withRelation?: boolean }) => {
    if (withRelation) {
      return await this.repository.findOne({
        where: {
          event: {
            id: eventId,
          },
          employee: employeeId,
        },
        relations: ['employee'],
      })
    }

    return this.repository.findOne({
      where: {
        event: {
          id: eventId,
        },
        employee: employeeId,
      },
    })
  }

  public getAllAnswersForEvent = async (eventId: number, withRelation?: boolean) => {
    if (withRelation) {
      return this.repository.find({
        where: {
          event: {
            id: eventId,
          },
        },
        relations: ['employee'],
      })
    } else {
      return this.repository.find({
        where: {
          event: {
            id: eventId,
          },
        },
      })
    }
  }

  public getAnswerIdsForEvent = async (eventId: number): Promise<number[]> => {
    const answers = await this.repository.find({
      select: {
        id: true,
      },
      where: {
        event: {
          id: eventId,
        },
      },
    })
    return answers.map(a => a.id)
  }

  public getAnswersForManyEvents = async (eventIds: number[], withRelation?: boolean) => {
    if (withRelation) {
      return this.repository.find({
        where: {
          event: In(eventIds),
        },
        relations: ['employee'],
      })
    } else {
      return this.repository.find({
        where: {
          event: In(eventIds),
        },
      })
    }
  }

  public getAllAnswersForEmployee = async (employeeId: number) => {
    return await this.repository.find({
      where: {
        employee: employeeId,
      },
    })
  }

  public getOne = async (answerId: number): Promise<AnswerEntity> => {
    return await this.repository.findOne({
      where: {
        id: answerId,
      },
    })
  }

  public getMany = async (ids: number[]) => {
    return this.repository.find({
      where: {
        id: In(ids),
      },
    })
  }

  public updateOneAnswer = async (id: number, answer: AnswerEntity) => {
    const answerToUpdate = await this.getOne(id)
    const updatedAnswer = {
      ...answerToUpdate,
      signedAt: new Date(),
      hasSigned: answer.hasSigned,
      reason: answer.reason,
    }
    await this.repository.save(updatedAnswer)
    return updatedAnswer
  }

  public deleteOne = async (id: number) => {
    const deleted = await this.repository.softDelete(id)
    return deleted
  }

  public deleteMany = async (ids: number[]) => {
    const deleted = await this.repository.softDelete(ids)
    return deleted
  }
}
