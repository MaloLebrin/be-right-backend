/* eslint-disable @typescript-eslint/indent */
import type { Request, Response } from 'express'
import type { EntityManager, FindOptionsWhere, Repository } from 'typeorm'
import { generateHash, paginator, userResponse, wrapperRequest } from '../utils'
import Context from '../context'
import { UserEntity, userSearchableFields } from '../entity/UserEntity'
import checkUserRole from '../middlewares/checkUserRole'
import { Role } from '../types/Role'
import { SubscriptionEnum } from '../types/Subscription'
import UserService from '../services/UserService'
import { createJwtToken, uniq } from '../utils/'
import type { PhotographerCreatePayload } from '../types'
import { APP_SOURCE } from '..'
import { SubscriptionService } from '../services/SubscriptionService'

export default class UserController {
  getManager: EntityManager
  UserService: UserService
  repository: Repository<UserEntity>
  SubscriptionService: SubscriptionService

  constructor() {
    this.getManager = APP_SOURCE.manager
    this.UserService = new UserService(APP_SOURCE)
    this.repository = APP_SOURCE.getRepository(UserEntity)
    this.SubscriptionService = new SubscriptionService(APP_SOURCE)
  }

  /**
   * @param user user: Partial<userEntity>
   * @returns return user just created
   */
  public newUser = async (req: Request, res: Response) => {
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

      const userAlReadyExist = await this.UserService.findOneByEmail(email)
      if (userAlReadyExist) {
        return res.status(400).json({ error: 'cet email existe déjà' })
      }

      const newUser = await this.UserService.createOneUser({
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
  public getAll = async (req: Request, res: Response) => {
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

      const usersToSend = search.map(user => userResponse(user))

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
  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      if (id) {
        const user = await this.UserService.getOneWithRelations(id)
        return user ? res.status(200).json(userResponse(user)) : res.status(500).json('user not found')
      }
      return res.status(422).json({ error: 'id required' })
    })
  }

  public getMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string
      if (ids) {
        const userIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))
        if (userIds) {
          const users = await this.UserService.getMany(userIds)
          return res.status(200).json(users)
        }
      }
    })
  }

  public getOneByToken = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const token = req.body.token
      if (token) {
        const user = await this.UserService.getByToken(token)
        return user ? res.status(200).json(userResponse(user)) : res.status(400).json({ message: 'l\'utilisateur n\'existe pas' })
      }
      return res.status(400).json({ error: 'token is required' })
    })
  }

  public updateTheme = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const { theme } = req.body
      const user = await this.UserService.updateTheme(id, theme)
      return res.status(200).json(userResponse(user))
    })
  }

  /**
   * @param event event: Partial<EventEntity>
   * @returns return event just updated
   */
  public updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { user }: { user: Partial<UserEntity> } = req.body
      const id = parseInt(req.params.id)
      if (id) {
        const ctx = Context.get(req)
        if (id === ctx.user.id || checkUserRole(Role.ADMIN)) {
          const userFinded = await this.UserService.getOne(id)

          const userUpdated = {
            ...userFinded,
            ...user,
            updatedAt: new Date(),
          }
          if (user.roles !== userFinded.roles) {
            userUpdated.token = createJwtToken({
              email: userUpdated.email,
              roles: userUpdated.roles,
              firstName: userUpdated.firstName,
              lastName: userUpdated.lastName,
              subscription: userUpdated.subscriptionLabel,
            })
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

  public updatesubscription = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const userId = parseInt(req.params.id)
      const { subscription }: { subscription: SubscriptionEnum } = req.body

      if (userId) {
        const user = await this.UserService.getOne(userId)
        await this.SubscriptionService.updateSubscription(user.subscriptionId, subscription)

        if (user) {
          user.token = createJwtToken({
            email: user.email,
            roles: user.roles,
            firstName: user.firstName,
            lastName: user.lastName,
            subscription,
          })
          await this.repository.save(user)
          return res.status(200).json(userResponse(user))
        }
      }
      return res.status(422).json({ error: 'id required' })
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
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

  public login = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email, password }: { email: string; password: string } = req.body

      const user = await this.repository.findOne({
        where: { email },
        relations: ['events', 'files', 'employee', 'profilePicture'],
      })

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
    })
  }

  public createPhotographer = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { photographer }: { photographer: PhotographerCreatePayload } = req.body
      const newPhotographer = await this.UserService.createPhotographer(photographer)
      return res.status(200).json(newPhotographer)
    })
  }

  public getPhotographerAlreadyWorkWith = async (req: Request, res: Response) => {
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

  public isMailAlreadyUsed = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email }: { email: string } = req.body
      if (email) {
        const userAlReadyExist = await this.UserService.findOneByEmail(email)

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
