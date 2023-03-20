/* eslint-disable @typescript-eslint/indent */
import type { Request, Response } from 'express'
import type { EntityManager, Repository } from 'typeorm'
import { generateHash, paginator, userResponse, wrapperRequest } from '../utils'
import Context from '../context'
import { UserEntity, userSearchableFields } from '../entity/UserEntity'
import type { Role } from '../types/Role'
import { SubscriptionEnum } from '../types/Subscription'
import UserService from '../services/UserService'
import { createJwtToken, generateRedisKey, isUserAdmin, uniqByKey } from '../utils/'
import type { RedisKeys } from '../types'
import { EntitiesEnum } from '../types'
import { APP_SOURCE, REDIS_CACHE } from '..'
import type RedisCache from '../RedisCache'
import { SubscriptionService } from '../services/SubscriptionService'
import { ApiError } from '../middlewares/ApiError'
import { AddressService } from '../services'
import EmployeeService from '../services/employee/EmployeeService'
import EventService from '../services/EventService'
import FileService from '../services/FileService'
import { CompanyEntity } from '../entity/Company.entity'

export default class UserController {
  getManager: EntityManager
  UserService: UserService
  repository: Repository<UserEntity>
  companyRepository: Repository<CompanyEntity>
  redisCache: RedisCache
  SubscriptionService: SubscriptionService
  AddressService: AddressService
  EmployeeService: EmployeeService
  EventService: EventService
  FileService: FileService

  constructor() {
    this.getManager = APP_SOURCE.manager
    this.UserService = new UserService(APP_SOURCE)
    this.repository = APP_SOURCE.getRepository(UserEntity)
    this.redisCache = REDIS_CACHE
    this.SubscriptionService = new SubscriptionService(APP_SOURCE)
    this.AddressService = new AddressService(APP_SOURCE)
    this.EmployeeService = new EmployeeService(APP_SOURCE)
    this.EventService = new EventService(APP_SOURCE)
    this.FileService = new FileService(APP_SOURCE)
    this.companyRepository = APP_SOURCE.getRepository(CompanyEntity)
  }

  private saveUserInCache = async (user: UserEntity) => {
    await this.redisCache.save(`user-id-${user.id}`, user)
  }

  /**
   * @param user user: Partial<userEntity>
   * @returns return user just created
   */
  public newUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const {
        email,
        firstName,
        lastName,
        password,
        role,
        companyId,
      }:
        {
          email: string
          firstName: string
          lastName: string
          password: string
          role: Role
          companyId: number
        } = req.body

      const userAlReadyExist = await this.UserService.findOneByEmail(email)
      if (userAlReadyExist) {
        throw new ApiError(423, 'cet email existe déjà')
      }

      let idCompany = companyId
      let company: null | CompanyEntity = null

      if (!idCompany) {
        const subscription = await this.SubscriptionService.createBasicSubscription()

        const newCompany = this.companyRepository.create({
          name: 'Zenika',
          subscription,
          subscriptionLabel: subscription.type,
        })
        company = await this.companyRepository.save(newCompany)

        idCompany = company.id
      } else {
        const ctx = Context.get(req)

        company = await this.companyRepository.findOne({
          where: {
            id: ctx.user.companyId,
          },
        })
      }

      const newUser = await this.UserService.createOneUser({
        email,
        firstName,
        lastName,
        password,
        role,
        subscription: SubscriptionEnum.BASIC,
        companyId: idCompany,
      })

      if (company.users && company.users.length > 0) {
        company.users = [...company.users, newUser]
      } else {
        company.owners = [newUser]
        company.users = [newUser]
      }

      await this.companyRepository.save(company)
      await this.saveUserInCache(newUser)

      return res.status(200).json(userResponse(newUser))
    })
  }

  /**
  * paginate function
  * @returns paginate response
  */
  public getAll = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { where, page, take, skip } = paginator(req, userSearchableFields)

      const [data, total] = await this.repository.findAndCount({
        take,
        skip,
        where,
      })

      return res.status(200).json({
        data: data.map(user => userResponse(user)),
        currentPage: page,
        limit: take,
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
        const user = await this.redisCache.get<UserEntity>(
          `user-id-${id}`,
          () => this.UserService.getOneWithRelations(id))

        if (user) {
          return res.status(200).json(userResponse(user))
        }
        throw new ApiError(404, 'Utilisateur non trouvé')
      }
    })
  }

  public getMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string
      if (ids) {
        const userIds = ids.split(',').map(id => parseInt(id)).filter(id => !isNaN(id))

        if (userIds) {
          const users = await this.redisCache.getMany<UserEntity>({
            keys: userIds.map(id => `user-id-${id}`) as RedisKeys[],
            typeofEntity: EntitiesEnum.USER,
            fetcher: () => this.UserService.getMany(userIds),
          })

          return res.status(200).json(users)
        }
      }
    })
  }

  public getOneByToken = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const token = req.body.token

      if (token) {
        const user = await this.redisCache.get<UserEntity>(
          `user-token-${token}`,
          () => this.UserService.getByToken(token, true))

        if (user) {
          await this.repository.update(user.id, {
            loggedAt: new Date(),
          })

          const company = await this.companyRepository.findOne({
            where: { id: user.companyId },
            relations: {
              address: true,
              employees: true,
              events: true,
              files: true,
              subscription: true,
              users: true,
            },
          })

          return res.status(200).json({
            user: userResponse(user),
            company,
          })
        }

        throw new ApiError(404, 'Utilisateur non trouvé')
      }
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

        if (id === ctx.user.id || isUserAdmin(ctx.user)) {
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
            })
          }

          await this.repository.save(userUpdated)
          await this.saveUserInCache(userUpdated)

          if (userUpdated) {
            return res.status(200).json(userResponse(userUpdated))
          }

          throw new ApiError(422, 'L\'utilisateur n\'a pas été mis à jour')
        } else {
          throw new ApiError(401, 'Action non autorisée')
        }
      }
      throw new ApiError(422, 'L\'identifiant de l\'utilisateur est requis')
    })
  }

  // public updatesubscription = async (req: Request, res: Response) => {
  //   await wrapperRequest(req, res, async () => {
  //     const userId = parseInt(req.params.id)
  //     const { subscription }: { subscription: SubscriptionEnum } = req.body

  //     if (userId) {
  //       const user = await this.UserService.getOne(userId)
  //       await this.SubscriptionService.updateSubscription(user.subscriptionId, subscription)

  //       if (user) {
  //         user.token = createJwtToken({
  //           email: user.email,
  //           roles: user.roles,
  //           firstName: user.firstName,
  //           lastName: user.lastName,
  //           subscription,
  //         })
  //         user.subscriptionLabel = subscription

  //         await this.repository.save(user)
  //         await this.saveUserInCache(user)
  //         return res.status(200).json(userResponse(user))
  //       }
  //     }
  //     throw new ApiError(422, 'L\'identifiant de l\'utilisateur est requis')
  //   })
  // }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)
      const ctx = Context.get(req)

      if (id === ctx.user.id || isUserAdmin(ctx.user)) {
        const userToDelete = await this.UserService.getOne(id, true)

        if (!userToDelete) {
          throw new ApiError(422, 'L\'utilisateur n\'éxiste pas')
        }

        if (userToDelete.company.addressId) {
          await this.AddressService.softDelete(userToDelete.company.addressId)

          await this.redisCache.invalidate(generateRedisKey({
            typeofEntity: EntitiesEnum.ADDRESS,
            field: 'id',
            id: userToDelete.company.addressId,
          }))
        }

        if (userToDelete.company.employeeIds?.length > 0) {
          await this.EmployeeService.deleteMany(userToDelete.company.employeeIds)

          await Promise.all(userToDelete.company.employeeIds.map(async id => {
            await this.redisCache.invalidate(generateRedisKey({
              typeofEntity: EntitiesEnum.EMPLOYEE,
              field: 'id',
              id,
            }))
          }))
        }

        if (userToDelete.company.events?.length > 0) {
          await Promise.all(userToDelete.company.events.map(async event => {
            await this.EventService.deleteOneAndRelations(event)
          }))
        }

        if (userToDelete.company.filesIds?.length > 0) {
          await this.FileService.deleteManyfiles(userToDelete.company.filesIds)
        }

        const userDeleted = await this.repository.softDelete(id)

        await this.redisCache.invalidate(`user-id-${id}`)

        if (userDeleted) {
          return res.status(204).json(userDeleted)
        }

        throw new ApiError(422, 'Utilisateur non supprimé')
      } else {
        throw new ApiError(401, 'Action non autorisée')
      }
    })
  }

  public login = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email, password }: { email: string; password: string } = req.body

      const user = await this.repository.findOne({
        where: { email },
        relations: {
          profilePicture: true,
          notificationSubscriptions: true,
        },
      })

      if (user && user.password && user.salt) {
        const passwordHashed = generateHash(user.salt, password)

        if (user.password === passwordHashed) {
          await this.repository.update(user.id, {
            loggedAt: new Date(),
          })

          const company = await this.companyRepository.findOne({
            where: { id: user.companyId },
            relations: {
              address: true,
              employees: true,
              events: true,
              files: true,
              subscription: true,
              users: true,
            },
          })

          const userToSend = userResponse(user)

          await this.saveUserInCache(userToSend)

          return res.status(200).json({
            user: userToSend,
            company,
          })
        } else {
          throw new ApiError(401, 'Identifiant et/ou mot de passe incorrect')
        }
      } else {
        throw new ApiError(404, 'Utilisateur non trouvé')
      }
    })
  }

  public createPhotographer = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { email, firstName, lastName }: { email: string; firstName: string; lastName: string } = req.body

      const newPhotographer = await this.UserService.createPhotographer({ email, firstName, lastName })

      return res.status(200).json(newPhotographer)
    })
  }

  public getPhotographerAlreadyWorkWith = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)

      if (ctx.user.companyId) {
        const company = await this.companyRepository.findOne({
          where: { id: ctx.user.companyId },
          relations: ['events', 'events.partner'],
        })

        if (company) {
          return res.status(200).json(uniqByKey(company.events.map(event => event.partner), 'id'))
        }

        return res.status(200).json([])
      }
      throw new ApiError(422, 'Veuillez renseigner l\'identifiant utilisateur')
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

      throw new ApiError(422, 'Veuillez renseigner l\'email')
    })
  }
}
