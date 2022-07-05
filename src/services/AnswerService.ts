import AnswerEntity from "../entity/AnswerEntity"
import { getManager } from "typeorm"
import { EmployeeEntity } from "@/entity"

export default class AnswerService {

  public static createOne = async (eventId: number, employeeId: number) => {
    const newAnswer = getManager().create(AnswerEntity, {
      event: eventId,
      employee: employeeId,
    })
    await getManager().save(newAnswer)
    return newAnswer
  }

  public static createMany = async (eventId: number, employeeIds: number[]) => {
    return employeeIds.map(employeeId => this.createOne(eventId, employeeId))
  }

  public static getOneAnswerForEventEmployee = async (eventId: number, employeeId: number) => {
    return await getManager().findOne(AnswerEntity, {
      where: {
        event: eventId,
        employee: employeeId,
      },
      relations: ["employee"],
    })
  }

  public static getAllAnswersForEvent = async (eventId: number, withRelation = true) => {
    const answers = await getManager().find(AnswerEntity, {
      where: {
        event: eventId,
      },
      relations: ["employee"],
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
    return await getManager().find(AnswerEntity, {
      where: {
        employee: employeeId,
      },
    })
  }

  public static async getOne(answerId: number): Promise<AnswerEntity> {
    return await getManager().findOne(AnswerEntity, answerId, {
      relations: ["employee"],
    })
  }

  public static updateOneAnswer = async (id: number, answer: AnswerEntity) => {
    const answerToUpdate = await getManager().findOne(AnswerEntity, id)
    const updatedAnswer = {
      ...answerToUpdate,
      signedAt: new Date(),
      hasSigned: answer.hasSigned,
      reason: answer.reason,
    }
    await getManager().save(updatedAnswer)
    return updatedAnswer
  }

  public static deleteOne = async (id: number) => {
    const deleted = await getManager().delete(AnswerEntity, id)
    return deleted
  }
}
