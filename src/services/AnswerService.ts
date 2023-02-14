import { sign } from 'jsonwebtoken'
import type { DataSource, EntityManager, Repository } from 'typeorm'
import { In } from 'typeorm'
import uid2 from 'uid2'
import AnswerEntity from '../entity/AnswerEntity'
import { EmployeeEntity } from '../entity/EmployeeEntity'
import EventEntity from '../entity/EventEntity'
import { useEnv } from '../env'

export default class AnswerService {
  getManager: EntityManager

  repository: Repository<AnswerEntity>
  eventRepository: Repository<EventEntity>
  employeeRepository: Repository<EmployeeEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(AnswerEntity)
    this.employeeRepository = APP_SOURCE.getRepository(EmployeeEntity)
    this.eventRepository = APP_SOURCE.getRepository(EventEntity)
    this.getManager = APP_SOURCE.manager
  }

  private generateAnswerToken(employee: EmployeeEntity, answerId: number) {
    const { JWT_SECRET } = useEnv()
    return sign(
      {
        employeeId: employee.id,
        email: employee.email,
        firstName: employee.firstName,
        lastName: employee.lastName,
        fullName: `${employee.firstName} ${employee.lastName}`,
        answerId,
        uniJWT: uid2(128),
      },
      JWT_SECRET,
    )
  }

  public createOne = async (eventId: number, employeeId: number) => {
    const event = await this.eventRepository.findOne({
      where: {
        id: eventId,
      },
    })

    const employee = await this.employeeRepository.findOne({
      where: {
        id: employeeId,
      },
    })

    const newAnswer = this.repository.create({
      event,
      employee: employeeId,
    })
    newAnswer.token = this.generateAnswerToken(employee, newAnswer.id)
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

  public getOne = async (answerId: number, withRelations?: boolean): Promise<AnswerEntity> => {
    if (withRelations) {
      return await this.repository.findOne({
        where: {
          id: answerId,
        },
        relations: ['employee', 'event'],
      })
    }

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
