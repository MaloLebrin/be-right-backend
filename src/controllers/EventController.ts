import type { Request, Response } from 'express'
import type { FindOptionsWhere, Repository } from 'typeorm'
import EventService from '../services/EventService'
import Context from '../context'
import EventEntity, { eventSearchableFields } from '../entity/EventEntity'
import checkUserRole from '../middlewares/checkUserRole'
import { paginator, wrapperRequest } from '../utils'
import AnswerService from '../services/AnswerService'
import { Role } from '../types'
import { isUserAdmin } from '../utils/'
import { AddressService } from '../services'
import { APP_SOURCE } from '..'
import type { AddressEntity } from '../entity/AddressEntity'
import type { EmployeeEntity } from '../entity/EmployeeEntity'
import type { UserEntity } from '../entity/UserEntity'

export default class EventController {
  AddressService: AddressService
  AnswerService: AnswerService
  EventService: EventService
  repository: Repository<EventEntity>

  constructor() {
    this.EventService = new EventService(APP_SOURCE)
    this.AnswerService = new AnswerService(APP_SOURCE)
    this.AddressService = new AddressService(APP_SOURCE)
    this.repository = APP_SOURCE.getRepository(EventEntity)
  }

  /**
   * @param event event: Partial<EventEntity>
   * @returns return event just created
   */
  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { event, address, photographerId }: { event: Partial<EventEntity>; address?: Partial<AddressEntity>; photographerId: number } = req.body
      const ctx = Context.get(req)
      let userId = null
      if (isUserAdmin(ctx.user)) {
        userId = parseInt(req.params.id)
      } else {
        userId = ctx.user.id
      }
      if (event && userId) {
        const newEvent = await this.EventService.createOneEvent(event, userId, photographerId)
        if (newEvent && address) {
          await this.AddressService.createOne({
            address,
            eventId: newEvent.id,
          })
        }
        return res.status(200).json(newEvent)
      }
      return res.status(422).json({ error: 'Formulaire imcomplet' })
    })
  }

  /**
   * @param Id number
   * @returns entity form given id
   */
  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const ctx = Context.get(req)
        const userId = ctx.user.id
        const event = await this.EventService.getOneEvent(id)
        if (checkUserRole(Role.ADMIN) || event.createdByUser === userId) {
          return res.status(200).json(event)
        } else {
          return res.status(401).json('unauthorized')
        }
      }
      return res.status(422).json({ error: 'identifiant de l\'événement manquant' })
    })
  }

  public getMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string
      const eventsIds = ids.split(',').map(id => parseInt(id))
      const events = await this.EventService.getManyEvents(eventsIds)
      return res.status(200).json(events)
    })
  }

  /**
   * @param id userId
   * @returns all event link with user
   */
  public getAllForUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)
      const userId = ctx.user.id
      const events = await this.repository.find({ where: { createdByUser: userId }, relations: ['partner'] })

      const eventsReturned = await Promise.all(events.map(async event => {
        const answers = await this.AnswerService.getAllAnswersForEvent(event.id)
        let employees = []
        if (answers.length > 0) {
          employees = answers.map(answer => {
            const employee = {
              ...answer.employee as unknown as EmployeeEntity,
              answer,
              event: event.id,
            }
            delete employee.answer.employee
            return employee
          }).filter(employee => employee)
        }
        const partner = event.partner as UserEntity
        return {
          ...event,
          employees: employees as EventEntity[],
          createdByUser: userId,
          partner: partner?.id,
        }
      }))

      return res.status(200).json(eventsReturned)
    })
  }

  /**
   * paginate function
   * @returns paginate response
   */
  public getAll = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const queriesFilters = paginator(req, eventSearchableFields)

      const [events, count] = await this.repository.findAndCount({
        ...queriesFilters,
        where: {
          ...queriesFilters.where as FindOptionsWhere<EventEntity>,
        },
        relations: ['createdByUser', 'partner', 'address'],
      })

      const eventsReturned = events.length > 0
        ? events.map(event => {
          const user = event.createdByUser as UserEntity
          const partner = event.partner as UserEntity
          if (user && user.id) {
            return {
              ...event,
              createdByUser: user?.id,
              partner: partner?.id,
            }
          }
          return event
        })
        : []

      return res.status(200).json({ data: eventsReturned, currentPage: queriesFilters.page, limit: queriesFilters.take, total: count })
    })
  }

  /**
   * @param event event: Partial<EventEntity>
   * @returns return event just updated
   */
  public updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { event }: { event: Partial<EventEntity> } = req.body
      const id = parseInt(req.params.id)
      if (id) {
        const ctx = Context.get(req)
        const userId = ctx.user.id
        const eventFinded = await this.EventService.getOneEvent(id)

        const user = eventFinded.createdByUser as UserEntity
        if (checkUserRole(Role.ADMIN) || user.id === userId) {
          const eventUpdated = await this.EventService.updateOneEvent(id, event as EventEntity)
          return res.status(200).json(eventUpdated)
        } else {
          return res.status(400).json('event not updated')
        }
      }
      return res.status(422).json({ error: 'identifiant de l\'événement manquant' })
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const ctx = Context.get(req)
        const userId = ctx.user.id
        const eventToDelete = await this.EventService.getOneWithoutRelations(id)

        if (eventToDelete.createdByUser === userId || checkUserRole(Role.ADMIN)) {
          await this.repository.softDelete(id)
          return res.status(204).json({ data: eventToDelete, message: 'event deleted' })
        } else {
          return res.status(401).json('Not allowed')
        }
      }
      return res.status(422).json({ error: 'identifiant de l\'événement manquant' })
    })
  }
}
