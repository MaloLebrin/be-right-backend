import type { DataSource, EntityManager, Repository } from 'typeorm'
import { In } from 'typeorm'
import AnswerEntity from '../entity/AnswerEntity'

export default class AnswerService {
  getManager: EntityManager

  repository: Repository<AnswerEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(AnswerEntity)
    this.getManager = APP_SOURCE.manager
  }

  public createOne = async (eventId: number, employeeId: number) => {
    const newAnswer = this.repository.create({
      event: eventId,
      employee: employeeId,
    })
    await this.repository.save(newAnswer)
    return newAnswer
  }

  public createMany = async (eventId: number, employeeIds: number[]) => {
    return Promise.all(employeeIds.map(employeeId => this.createOne(eventId, employeeId)))
  }

  public getOneAnswerForEventEmployee = async (eventId: number, employeeId: number) => {
    return await this.repository.findOne({
      where: {
        event: eventId,
        employee: employeeId,
      },
      relations: ['employee'],
    })
  }

  public getAllAnswersForEvent = async (eventId: number, withRelation = true) => {
    if (withRelation) {
      return this.repository.find({
        where: {
          event: eventId,
        },
        relations: ['employee'],
      })
    } else {
      return this.repository.find({
        where: {
          event: eventId,
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
}
