import type { EmployeeEntity } from '../entity/'
import { APP_SOURCE } from '..'
import AnswerEntity from '../entity/AnswerEntity'

export default class AnswerService {
  static repository = APP_SOURCE.getRepository(AnswerEntity)

  public static createOne = async (eventId: number, employeeId: number) => {
    const newAnswer = this.repository.create({
      event: eventId,
      employee: employeeId,
    })
    await this.repository.save(newAnswer)
    return newAnswer
  }

  public static createMany = async (eventId: number, employeeIds: number[]) => {
    return employeeIds.map(employeeId => this.createOne(eventId, employeeId))
  }

  public static getOneAnswerForEventEmployee = async (eventId: number, employeeId: number) => {
    return await this.repository.findOne({
      where: {
        event: eventId,
        employee: employeeId,
      },
      relations: ['employee'],
    })
  }

  public static getAllAnswersForEvent = async (eventId: number, withRelation = true) => {
    const answers = await this.repository.find({
      where: {
        event: eventId,
      },
      relations: ['employee'],
    })

    if (withRelation) {
      return answers.map(answer => ({ ...answer, event: eventId }))
    } else {
      return answers.map(answer => {
        const employee = answer.employee as EmployeeEntity
        return {
          ...answer,
          event: eventId,
          employee: employee.id,
        }
      })
    }
  }

  public static getAllAnswersForEmployee = async (employeeId: number) => {
    return await this.repository.find({
      where: {
        employee: employeeId,
      },
    })
  }

  public static async getOne(answerId: number): Promise<AnswerEntity> {
    return await this.repository.findOne({
      where: {
        id: answerId,
      },
      relations: ['employee'],
    })
  }

  public static updateOneAnswer = async (id: number, answer: AnswerEntity) => {
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

  public static deleteOne = async (id: number) => {
    const deleted = await this.repository.delete(id)
    return deleted
  }
}
