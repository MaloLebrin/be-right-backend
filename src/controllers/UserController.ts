/* eslint-disable @typescript-eslint/indent */
import type { Request, Response } from 'express'
import type { FindOptionsWhere } from 'typeorm'
import { generateHash, paginator, userResponse, wrapperRequest } from '../utils'
import Context from '../context'
import { UserEntity, userSearchableFields } from '../entity/UserEntity'
import checkUserRole from '../middlewares/checkUserRole'
import { Role } from '../types/Role'
import { SubscriptionEnum } from '../types/Subscription'
import UserService from '../services/UserService'
import type EventEntity from '../entity/EventEntity'
import type { EmployeeEntity } from '../entity/EmployeeEntity'
import type { FileEntity } from '../entity/FileEntity'
import { addUserToEntityRelation, createJwtToken, uniq } from '../utils/'
import type { JWTTokenPayload, PhotographerCreatePayload } from '../types'
import { useEnv } from '../env'
import { APP_SOURCE } from '..'

export default class UserController {
  static getManager = APP_SOURCE.manager

  static repository = APP_SOURCE.getRepository(UserEntity)

  /**
   * @param user user: Partial<userEntity>
   * @returns return user just created
   */
  public static newUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
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

      const userAlReadyExist = await UserService.findOneByEmail(email)
      if (userAlReadyExist) {
        return res.status(400).json({ error: 'cet email existe déjà' })
      }

      const newUser = await UserService.createOneUser({
        companyName,
        email,
        firstName,
        lastName,
        password,
        role,
        subscription: SubscriptionEnum.BASIC,
      })

      return res.status(200).json(userResponse(newUser))
    })
  }

  /**
  * paginate function
  * @returns paginate response
  */
  public static getAll = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const queriesFilters = paginator(req, userSearchableFields)
      const usersFilters = {
        ...queriesFilters,
        relations: ['events', 'files', 'employee', 'profilePicture'],
        // TODO find a way to not filter with search filed on subscription
      }

      const [search, total] = await this.repository.findAndCount({
        ...usersFilters,
        where: {
          ...usersFilters.where as FindOptionsWhere<UserEntity>,
        },
      })

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

      return res.status(200).json({
        data: usersToSend,
        currentPage: queriesFilters.page,
        limit: queriesFilters.take,
        total,
      })
    })
  }

  /**
   * @param Id number
   * @returns entity form given id
  */
  public static getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const user = await UserService.getOneWithRelations(id)
        return user ? res.status(200).json(userResponse(user)) : res.status(500).json('user not found')
      }
      return res.status(422).json({ error: 'id required' })
    })
  }

  public static getMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string
      if (ids) {
        const userIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
        if (userIds) {
          const users = await UserService.getMany(userIds)
          return res.status(200).json(users)
        }
      }
    })
  }

  public static getOneByToken = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const token = req.body.token
      if (token) {
        const user = await UserService.getByToken(token)
        return user ? res.status(200).json(userResponse(user)) : res.status(400).json({ message: 'l\'utilisateur n\'existe pas' })
      }
      return res.status(400).json({ error: 'token is required' })
    })
  }

  public static updateTheme = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const { theme } = req.body
      const user = await UserService.updateTheme(id, theme)
      return res.status(200).json(userResponse(user))
    })
  }

  /**
   * @param event event: Partial<EventEntity>
   * @returns return event just updated
   */
  public static updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { user }: { user: Partial<UserEntity> } = req.body
      const id = parseInt(req.params.id)
      if (id) {
        const ctx = Context.get(req)
        if (id === ctx.user.id || checkUserRole(Role.ADMIN)) {
          const userFinded = await UserService.getOne(id)

          const userUpdated = {
            ...userFinded,
            ...user,
            updatedAt: new Date(),
          }
          if (user.roles !== userFinded.roles) {
            userUpdated.token = createJwtToken(userUpdated)
          }

          await this.repository.save(userUpdated)
          return userUpdated ? res.status(200).json(userResponse(userUpdated)) : res.status(400).json('user not updated')
        } else {
          return res.status(401).json({ error: 'unauthorized' })
        }
      }
      return res.status(422).json({ error: 'id required' })
    })
  }

  public static updatesubscription = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const userId = parseInt(req.params.id)
      const { subscription }: { subscription: SubscriptionEnum } = req.body

      if (userId) {
        const user = await UserService.getOne(userId)

        if (user) {
          user.subscription = subscription
          user.token = createJwtToken(user)
          await this.repository.save(user)
          return res.status(200).json(userResponse(user))
        }
      }
      return res.status(422).json({ error: 'id required' })
    })
  }

  public static deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const ctx = Context.get(req)
      if (id === ctx.user.id || checkUserRole(Role.ADMIN)) {
        const userDeleted = await this.repository.softDelete(id)
        return userDeleted ? res.status(204).json(userDeleted) : res.status(400).json('Not deleted')
      } else {
        return res.status(401).json({ error: 'unauthorized' })
      }
    })
  }

  public static login = async (req: Request, res: Response) => {
    const { ADMIN_EMAIL, ADMIN_PASSWORD } = useEnv()

    await wrapperRequest(req, res, async () => {
      const { email, password }: { email: string; password: string } = req.body
      const userFinded = await this.repository.findOne({
        where: { email },
        relations: ['events', 'files', 'employee', 'profilePicture'],
      })

      // TODO remove this in prod
      if (userFinded && userFinded.email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        if (userFinded.roles !== Role.ADMIN) {
          userFinded.token = createJwtToken({
            roles: Role.ADMIN,
            firstName: userFinded.firstName,
            lastName: userFinded.lastName,
            bla: Role.ADMIN,
            subscription: SubscriptionEnum.PREMIUM,
          } as JWTTokenPayload)
          userFinded.subscription = SubscriptionEnum.PREMIUM
          userFinded.roles = Role.ADMIN
          await this.repository.save(userFinded)
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
    })
  }

  public static createPhotographer = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { photographer }: { photographer: PhotographerCreatePayload } = req.body
      const newPhotographer = await UserService.createPhotographer(photographer)
      return res.status(200).json(newPhotographer)
    })
  }

  public static getPhotographerAlreadyWorkWith = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const user = await await this.repository.findOne({
          where: { id },
          relations: ['events', 'events.partner'],
        })

        const events = user.events
        const partners = events.map(event => event.partner) as UserEntity[]
        const uniqPartnersIds = uniq(partners.map(user => user.id))
        const uniqPartners = partners.filter(user => uniqPartnersIds.includes(user.id))
        return res.status(200).json(uniqPartners)
      }
      return res.status(422).json({ error: 'Veuillez renseigner l\'identifiant utilisateur' })
    })
  }

  public static isMailAlreadyUsed = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email }: { email: string } = req.body
      if (email) {
        const userAlReadyExist = await UserService.findOneByEmail(email)

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
    })
  }
}
