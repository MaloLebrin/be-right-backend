import type { Request, Response } from 'express'
import { getManager } from 'typeorm'
import uid2 from 'uid2'
import { generateHash, paginator, userResponse } from '../utils'
import Context from '../context'
import { UserEntity, userSearchableFields } from '../entity/UserEntity'
import checkUserRole from '../middlewares/checkUserRole'
import { Role } from '../types/Role'
import { SubscriptionEnum } from '../types/Subscription'
import UserService from '../services/UserService'
import type EventEntity from '../entity/EventEntity'
import type { EmployeeEntity } from '../entity/EmployeeEntity'
import type { FileEntity } from '../entity/FileEntity'
import { addUserToEntityRelation, uniq } from '../utils/'
import type { PhotographerCreatePayload } from '../types'

export default class UserController {
  /**
   * @param user user: Partial<userEntity>
   * @returns return user just created
   */
  public static newUser = async (req: Request, res: Response) => {
    const {
      companyName,
      email,
      firstName,
      lastName,
      password,
      role,
    }:
      {
        companyName: string
        email: string
        firstName: string
        lastName: string
        password: string
        role: Role
      } = req.body
    try {
      const userAlReadyExist = await getManager().findOne(UserEntity, { email })
      if (userAlReadyExist) {
        return res.status(400).json({ error: 'cet email existe déjà' })
      }
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
        events: [],
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
        relations: ['events', 'files', 'employee', 'profilePicture'],
        // TODO find a way to not filter with search filed on subscription
      }
      const search = await getManager().find(UserEntity, usersFilters)
      const users = search.map(user => {
        const events = user.events as EventEntity[]
        const employees = user.employee as EmployeeEntity[]
        const files = user.files as FileEntity[]
        return {
          ...user,
          events: addUserToEntityRelation(events, user.id),
          employee: addUserToEntityRelation(employees, user.id),
          files: addUserToEntityRelation(files, user.id),
        }
      })
      const usersToSend = users.map(user => userResponse(user))
      const total = await getManager().count(UserEntity, usersFilters)
      return res.status(200).json({ data: usersToSend, currentPage: queriesFilters.page, limit: queriesFilters.take, total })
    } catch (error) {
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
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
      if (id) {
        const user = await UserService.getOneWithRelations(id)
        return user ? res.status(200).json(userResponse(user)) : res.status(500).json('user not found')
      }
      return res.status(422).json({ error: 'id required' })
    } catch (error) {
      return res.status(400).json({ error: error.message })
    }
  }

  public static getMany = async (req: Request, res: Response) => {
    try {
      const ids = req.query.ids as string
      if (ids) {
        const userIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
        if (userIds) {
          const users = await UserService.getMany(userIds)
          return res.status(200).json(users)
        }
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static getOneByToken = async (req: Request, res: Response) => {
    try {
      const token = req.body.token
      if (token) {
        const user = await UserService.getByToken(token)
        return user ? res.status(200).json(userResponse(user)) : res.status(400).json({ message: 'l\'utilisateur n\'existe pas' })
      } else {
        return res.status(400).json({ error: 'token is required' })
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
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
        return res.status(error.status || 500).json({ error: error.message })
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
      if (id) {
        const ctx = Context.get(req)
        if (id === ctx.user.id || checkUserRole(Role.ADMIN)) {
          const userFinded = await getManager().findOne(UserEntity, id)
          const userUpdated = {
            ...userFinded,
            ...user,
            updatedAt: new Date(),
          }
          await getManager().save(UserEntity, userUpdated)
          return userUpdated ? res.status(200).json(userResponse(userUpdated)) : res.status(400).json('user not updated')
        } else {
          return res.status(401).json({ error: 'unauthorized' })
        }
      }
      return res.status(422).json({ error: 'id required' })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static updatesubscription = async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.id)
      const { subscription }: { subscription: SubscriptionEnum } = req.body
      if (userId) {
        const user = await getManager().findOne(UserEntity, userId)
        if (user) {
          user.subscription = subscription
          await getManager().save(user)
          return res.status(200).json(userResponse(user))
        }
      }
      return res.status(422).json({ error: 'id required' })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static deleteOne = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      const ctx = Context.get(req)
      if (id === ctx.user.id || checkUserRole(Role.ADMIN)) {
        const userDeleted = await getManager().delete(UserEntity, id)
        return userDeleted ? res.status(204).json(userDeleted) : res.status(400).json('Not deleted')
      } else {
        return res.status(401).json({ error: 'unauthorized' })
      }
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static login = async (req: Request, res: Response) => {
    try {
      const { email, password }: { email: string; password: string } = req.body
      const userFinded = await getManager().findOne(UserEntity, { email }, { relations: ['events', 'files', 'employee', 'profilePicture'] })
      // TODO remove this in prod
      if (userFinded && userFinded.email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
        if (userFinded.roles !== Role.ADMIN) {
          userFinded.subscription = SubscriptionEnum.PREMIUM
          userFinded.roles = Role.ADMIN
          await getManager().save(userFinded)
        }
      }

      if (userFinded) {
        const events = userFinded.events as EventEntity[]
        const employees = userFinded.employee as EmployeeEntity[]
        const files = userFinded.files as FileEntity[]
        const user = {
          ...userFinded,
          events: addUserToEntityRelation(events, userFinded.id),
          employee: addUserToEntityRelation(employees, userFinded.id),
          files: addUserToEntityRelation(files, userFinded.id),
        }
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
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static createPhotographer = async (req: Request, res: Response) => {
    try {
      const { photographer }: { photographer: PhotographerCreatePayload } = req.body
      const userAlReadyExist = await getManager().findOne(UserEntity, { email: photographer.email })
      if (userAlReadyExist) {
        await UserService.updateOne(userAlReadyExist.id, {
          ...userAlReadyExist,
          ...photographer,
        })
        const newPhotographer = await UserService.getOneWithRelations(userAlReadyExist.id)
        return res.status(200).json(newPhotographer)
      }
      const newPhotographer = await UserService.createOnePhotoGrapher(photographer)
      return res.status(200).json(newPhotographer)
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static getPhotographerAlreadyWorkWith = async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id)
      if (id) {
        const user = await getManager().findOne(UserEntity, { id }, { relations: ['events', 'events.partner'] })
        const events = user.events
        const partners = events.map(event => event.partner) as UserEntity[]
        const uniqPartnersIds = uniq(partners.map(user => user.id))
        const uniqPartners = partners.filter(user => uniqPartnersIds.includes(user.id))
        return res.status(200).json(uniqPartners)
      }
      return res.status(422).json({ error: 'Veuillez renseigner l\'identifiant utilisateur' })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  public static isMailAlreadyUsed = async (req: Request, res: Response) => {
    try {
      const { email }: { email: string } = req.body
      if (email) {
        const userAlReadyExist = await getManager().findOne(UserEntity, { email })
        if (userAlReadyExist) {
          return res.status(200).json({
            success: false,
            message: 'Cet email est déjà utilisée',
          })
        }
        return res.status(200).json({
          success: true,
          message: 'Cet email n\'est pas déjà utilisée',
        })
      }
      return res.status(422).json({ error: 'Veuillez renseigner l\'email' })
    } catch (error) {
      console.error(error)
      if (error.status) {
        return res.status(error.status || 500).json({ error: error.message })
      }
      return res.status(400).json({ error: error.message })
    }
  }

  // public static clear = async (req: Request, res: Response) => {
  //   try {
  //     return await getManager().clear(UserEntity)
  //   } catch (error) {
  //     return res.status(401).json({ error: error.message })
  //   }
  // }
}
