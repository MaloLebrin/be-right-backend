import { paginator } from '../utils'
import { Request, Response } from "express"
import { getManager } from "typeorm"
import uid2 from "uid2"
import Context from "../context"
import { UserEntity, userSearchableFields } from "../entity/UserEntity"
import checkUserRole from "../middlewares/checkUserRole"
import { Role } from "../types/Role"
import { generateHash, userResponse } from "../utils"
import { SubscriptionEnum } from '../types/Subscription'
import UserService from '../services/UserService'
import EventEntity from '../entity/EventEntity'
import { EmployeeEntity } from '../entity/EmployeeEntity'
import { FileEntity } from '../entity/FileEntity'

export default class UserController {

    /**
     * @param user user: Partial<userEntity>
     * @returns return user just created
     */
    public static newUser = async (req: Request, res: Response) => {
        const { companyName, email, firstName, lastName, password, role }: { companyName: string, email: string, firstName: string, lastName: string, password: string, role: Role } = req.body
        try {
            const salt = uid2(128)
            const token = uid2(128)
            const user = {
                companyName,
                email,
                firstName,
                lastName,
                salt,
                roles: role,
                token,
                password: generateHash(salt, password),
                events: []
            }
            const newUser = getManager().create(UserEntity, user)
            await getManager().save(newUser)
            return res.status(200).json(userResponse(newUser))
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    /**
    * paginate function
    * @returns paginate response
    */
    public static getAll = async (req: Request, res: Response) => {
        try {
            const queriesFilters = paginator(req, userSearchableFields)
            const usersFilters = {
                ...queriesFilters,
                relations: ["events", "files", "employee"],
            }
            const search = await getManager().find(UserEntity, usersFilters)
            const users = search.map(user => {
                const events = user.events as EventEntity[]
                const employees = user.employee as EmployeeEntity[]
                const files = user.files as FileEntity[]
                return {
                    ...user,
                    events: events.map(event => ({
                        ...event,
                        createdByUser: user.id,
                    })),
                    employee: employees.map(employee => ({
                        ...employee,
                        createdByUser: user.id,
                    })),
                    files: files.map(file => ({
                        ...file,
                        createdByUser: user.id,
                    })),
                }
            })
            const usersToSend = users.map(user => userResponse(user))
            const total = await getManager().count(UserEntity, usersFilters)
            return res.status(200).json({ data: usersToSend, currentPage: queriesFilters.page, limit: queriesFilters.take, total })
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
            const user = await UserService.getOneWithRelations(id)
            return user ? res.status(200).json(userResponse(user)) : res.status(400).json('user not found')
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    public static getOneByToken = async (req: Request, res: Response) => {
        try {
            const token = req.body.token
            const user = await UserService.getByToken(token)
            return user ? res.status(200).json(userResponse(user)) : res.status(400).json('user not found')
        } catch (error) {
            console.error(error)
            if (error.status) {
                return res.status(error.status).json({ error: error.message })
            }
            return res.status(400).json({ error: error.message })
        }
    }

    public static updateTheme = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id)
            const { theme } = req.body
            const user = await UserService.updateTheme(id, theme)
            return res.status(200).json(userResponse(user))
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
            const { user }: { user: Partial<UserEntity> } = req.body
            const id = parseInt(req.params.id)
            const ctx = Context.get(req)
            if (id === ctx.user.id || checkUserRole(Role.ADMIN)) {
                const userFinded = await getManager().findOne(UserEntity, id)
                const userUpdated = {
                    ...userFinded,
                    ...user,
                    updatedAt: new Date(),
                }
                await getManager().save(UserEntity, user)
                return userUpdated ? res.status(200).json(userResponse(userUpdated)) : res.status(400).json('user not updated')
            } else {
                return res.status(401).json({ error: "unauthorized" })
            }
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    public static updatesubscription = async (req: Request, res: Response) => {
        try {
            const userId = parseInt(req.params.id)
            const { subscription }: { subscription: SubscriptionEnum } = req.body
            const user = await getManager().findOne(UserEntity, userId)
            if (user) {
                user.subscription = subscription
                await getManager().save(user)
                return res.status(200).json(userResponse(user))
            }
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    public static deleteOne = async (req: Request, res: Response) => {
        try {
            const id = parseInt(req.params.id)
            const ctx = Context.get(req)
            if (id === ctx.user.id || checkUserRole(Role.ADMIN)) {
                const userDeleted = await getManager().delete(UserEntity, id)
                return userDeleted ? res.status(204).json(userResponse(userDeleted)) : res.status(400).json('Not deleted')
            } else {
                return res.status(401).json({ error: "unauthorized" })
            }
        } catch (error) {
            return res.status(400).json({ error: error.message })
        }
    }

    public static login = async (req: Request, res: Response) => {
        try {
            const { email, password }: { email: string, password: string } = req.body
            const userFinded = await getManager().findOne(UserEntity, { email }, { relations: ["events", "files", "employee"] })

            if (userFinded && userFinded.email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                if (userFinded.roles !== Role.ADMIN) {                    
                    userFinded.subscription = SubscriptionEnum.PREMIUM
                    userFinded.roles = Role.ADMIN
                    await getManager().save(userFinded)
                }
            }

            const events = userFinded.events as EventEntity[]
            const employees = userFinded.employee as EmployeeEntity[]
            const files = userFinded.files as FileEntity[]
            const user = {
                ...userFinded,
                events: events.map(event => ({
                    ...event,
                    createdByUser: userFinded.id,
                })),
                employee: employees.map(employee => ({
                    ...employee,
                    createdByUser: userFinded.id,
                })),
                files: files.map(file => ({
                    ...file,
                    createdByUser: userFinded.id,
                })),
            }

            if (user) {
                const passwordHashed = generateHash(user.salt, password)
                if (user.password === passwordHashed) {
                    return res.status(200).json(userResponse(user))
                } else {
                    return res.status(401).json('wrong password')
                }
            } else {
                return res.status(400).json('user not found')
            }
        } catch (error) {
            return res.status(401).json({ error: error.message })
        }
    }

    public static clear = async (req: Request, res: Response) => {
        try {
            return await getManager().clear(UserEntity)
        } catch (error) {
            return res.status(401).json({ error: error.message })
        }
    }
}