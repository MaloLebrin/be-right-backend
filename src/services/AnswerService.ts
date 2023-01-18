import type { DataSource, EntityManager, Repository } from 'typeorm'
import AnswerEntity from '../entity/AnswerEntity'

export default class AnswerService {
  getManager: EntityManager

  repository: Repository<AnswerEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(AnswerEntity)
    this.getManager = APP_SOURCE.manager
  }

  async createOne(eventId: number, employeeId: number) {
    const newAnswer = this.repository.create({
      event: eventId,
      employee: employeeId,
    })
    await this.repository.save(newAnswer)
    return newAnswer
  }

  async createMany(eventId: number, employeeIds: number[]) {
    return employeeIds.map(employeeId => this.createOne(eventId, employeeId))
  }

  async getOneAnswerForEventEmployee(eventId: number, employeeId: number) {
    return await this.repository.findOne({
      where: {
        event: eventId,
        employee: employeeId,
      },
      relations: ['employee'],
    })
  }

  async getAllAnswersForEvent(eventId: number, withRelation = true) {
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

  async getAllAnswersForEmployee(employeeId: number) {
    return await this.repository.find({
      where: {
        employee: employeeId,
      },
    })
  }

  async getOne(answerId: number): Promise<AnswerEntity> {
    return await this.repository.findOne({
      where: {
        id: answerId,
      },
      relations: ['employee'],
    })
  }

  async updateOneAnswer(id: number, answer: AnswerEntity) {
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

  async deleteOne(id: number) {
    const deleted = await this.repository.softDelete(id)
    return deleted
  }
}
