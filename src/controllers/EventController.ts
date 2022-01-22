import EventService from "../services/EventService"
import { Request, Response } from "express"
import { getManager } from "typeorm"
import Context from "../context"
import EventEntity, { eventSearchableFields } from "../entity/EventEntity"
import { UserEntity } from "../entity/UserEntity"
import checkUserRole from "../middlewares/checkUserRole"
import { Role } from "../types/Role"
import { paginator } from "../utils"
import AnswerService from "../services/AnswerService"
import { EmployeeEntity } from "../entity"

export default class EventController {

  /**
   * @param event event: Partial<EventEntity>
   * @returns return event just created
   */
  public static createOne = async (req: Request, res: Response) => {
    try {
      const { event }: { event: Partial<EventEntity> } = req.body
      const ctx = Context.get(req)
      let userId = null
      if (ctx.user.roles === Role.ADMIN) {
        userId = parseInt(req.params.id)
      } else {
        userId = ctx.user.id
      }
      const eventToCreate = {
        ...event,
        createdByUser: userId
      }
      const user = await getManager().findOne(UserEntity, userId)
      const newEvent = getManager().create(EventEntity, eventToCreate)
      user.events = [newEvent]
      await getManager().save([newEvent, user])
      return res.status(200).json({ ...newEvent, createdByUser: user.id })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  /**
   * @param Id number
   * @returns entity form given id
   */
  public static getOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      const ctx = Context.get(req)
      const userId = ctx.user.id
      const event = await EventService.getOneEvent(id)
      if (checkUserRole(Role.ADMIN) || event.createdByUser === userId) {
        return res.status(200).json(event)
      } else {
        return res.status(401).json('unauthorized')
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static getMany = async (req: Request, res: Response) => {
    try {
      const ids = req.query.ids as string
      const eventsIds = ids.split(',').map(id => parseInt(id))
      const events = await EventService.getManyEvents(eventsIds)
      return res.status(200).json(events)
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }


  /**
   * @param id userId 
   * @returns all event link with user
   */
  public static getAllForUser = async (req: Request, res: Response) => {
    try {
      const ctx = Context.get(req)
      const userId = ctx.user.id
      const events = await getManager().find(EventEntity, { where: { createdByUser: userId } })
      const eventsReturned = await Promise.all(events.map(async (event) => {
        const answers = await AnswerService.getAllAnswersForEvent(event.id)
        let employees = []
        if (answers.length > 0) {

          employees = answers.map(answer => {
            const employee = {
              ...answer.employee as unknown as EmployeeEntity,
              answer: answer,
              event: event.id
            }
            delete employee.answer.employee
            return employee
          }).filter(employee => employee)
        }

        return {
          ...event,
          employees: employees as EventEntity[],
          createdByUser: userId,
        }
      }))

      return res.status(200).json(eventsReturned)
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  /**
   * paginate function
   * @returns paginate response
   */
  public static getAll = async (req: Request, res: Response) => {
    try {
      const queriesFilters = paginator(req, eventSearchableFields)
      const events = await getManager().find(EventEntity, { ...queriesFilters, relations: ["createdByUser"] })
      const eventsReturned = events.map(event => {
        const user = event.createdByUser as UserEntity
        return {
          ...event,
          createdByUser: user.id
        }
      })
      const total = await getManager().count(EventEntity, queriesFilters)
      return res.status(200).json({ data: eventsReturned, currentPage: queriesFilters.page, limit: queriesFilters.take, total })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  /**
   * @param event event: Partial<EventEntity>
   * @returns return event just updated
   */
  public static updateOne = async (req: Request, res: Response) => {
    try {
      const { event }: { event: Partial<EventEntity> } = req.body
      const id = parseInt(req.params.id)
      const ctx = Context.get(req)
      const userId = ctx.user.id
      const eventFinded = await EventService.getOneEvent(id)

      const user = eventFinded.createdByUser as UserEntity
      if (checkUserRole(Role.ADMIN) || user.id === userId) {
        const eventUpdated = await EventService.updateOneEvent(id, event as EventEntity)
        return res.status(200).json(eventUpdated)
      } else {
        return res.status(400).json('event not updated')
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static deleteOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      const ctx = Context.get(req)
      const userId = ctx.user.id
      const eventToDelete = await getManager().findOne(EventEntity, id)
      if (eventToDelete.createdByUser === userId || checkUserRole(Role.ADMIN)) {
        await getManager().delete(EventEntity, id)
        return res.status(204).json({ data: eventToDelete, message: 'event deleted' })
      } else {
        return res.status(401).json('Not allowed')
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }
}