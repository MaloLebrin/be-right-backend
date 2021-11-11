import { Request, Response } from "express"
import { getManager } from "typeorm"
import Context from "../context"
import EventEntity, { eventSearchableFields } from "../entity/EventEntity"
import { UserEntity } from "../entity/UserEntity"
import checkUserRole from "../middlewares/checkUserRole"
import { Role } from "../types/Role"
import { paginator } from "../utils"

export default class EventController {

    /**
     * @param event event: Partial<EventEntity>
     * @returns return event just created
     */
    public static createOne = async (req: Request, res: Response) => {
        try {
            const { event }: { event: Partial<EventEntity> } = req.body
            const ctx = Context.get(req)
            const userId = ctx.user.id
            const eventToCreate = {
                ...event,
                user: userId
            }
            const user = await getManager().findOne(UserEntity, userId)
            const newEvent = getManager().create(EventEntity, eventToCreate)
            user.events = [newEvent]
            await getManager().save([newEvent, user])
            return res.status(200).json(newEvent)
        } catch (error) {
            return res.status(error.status).json({ error: error.message })
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
            const event = await getManager().findOne(EventEntity, id, { relations: ["employees"] })
            if (checkUserRole(Role.ADMIN) || event.user === userId) {
                return res.status(200).json(event)
            } else {
                return res.status(401).json('unauthorized')
            }
        } catch (error) {
            return res.status(error.status).json({ error: error.message })
        }
    }

    /**
     * @param ids Array of ids 
     * @returns each event
     */
    public static getMany = async (req: Request, res: Response) => {
        try {
            const { ids }: { ids: number[] } = req.body
            const events = await Promise.all(ids.map(id => getManager().findOne(EventEntity, id, { relations: ["employees"] })))
            return res.status(200).json({ data: events, total: events.length })
        } catch (error) {
            return res.status(error.status).json({ error: error.message })
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
            const filters = {
                user: userId,
                relations: ["employees"],
            }
            const events = await getManager().find(EventEntity, filters)
            return res.status(200).json({ data: events, count: events.length })
        } catch (error) {
            return res.status(error.status).json({ error: error.message })
        }
    }

    /**
     * paginate function
     * @returns paginate response
     */
    public static getAll = async (req: Request, res: Response) => {
        try {
            const queriesFilters = paginator(req, eventSearchableFields)
            const eventFilters = {
                ...queriesFilters,
                relations: ["employees"],
            }
            const events = await getManager().find(EventEntity, eventFilters)
            const total = await getManager().count(EventEntity, eventFilters)
            return res.status(200).json({ data: events, currentPage: queriesFilters.page, limit: queriesFilters.take, total })
        } catch (error) {
            return res.status(error.status).json({ error: error.message })
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
            const eventFinded = await getManager().findOne(EventEntity, id)
            if (checkUserRole(Role.ADMIN) || eventFinded.user === userId) {
                const eventUpdated = {
                    ...eventFinded,
                    ...event,
                    updatedAt: new Date(),
                }
                await getManager().save(eventUpdated)
                return res.status(200).json(eventUpdated)
            } else {
                return res.status(400).json('event not updated')
            }
        } catch (error) {
            return res.status(error.status).json({ error: error.message })
        }
    }

    public static deleteOne = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id)
            const ctx = Context.get(req)
            const userId = ctx.user.id
            const eventToDelete = await getManager().findOne(EventEntity, id)
            if (eventToDelete.user === userId || checkUserRole(Role.ADMIN)) {
                await getManager().delete(EventEntity, id)
                return res.status(204).json({ data: eventToDelete, message: 'event deleted' })
            } else {
                return res.status(401).json('Not allowed')
            }
        } catch (error) {
            return res.status(error.status).json({ error: error.message })
        }
    }
}