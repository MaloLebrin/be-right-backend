/* eslint-disable @typescript-eslint/indent */
import type { Request, Response } from 'express'
import type { DataSource, FindOptionsWhere, Repository } from 'typeorm'
import { generateHash, wrapperRequest } from '../utils'
import Context from '../context'
import { UserEntity, userRelationFields, userSearchableFields } from '../entity/UserEntity'
import { Role } from '../types/Role'
import { SubscriptionEnum } from '../types/Subscription'
import UserService from '../services/UserService'
import { createJwtToken, generateRedisKey, isUserAdmin, uniqByKey, userResponse } from '../utils/'
import type { RedisKeys } from '../types'
import { EntitiesEnum } from '../types'
import { REDIS_CACHE } from '..'
import type RedisCache from '../RedisCache'
import { ApiError } from '../middlewares/ApiError'
import { AddressService } from '../services'
import EmployeeService from '../services/employee/EmployeeService'
import EventService from '../services/EventService'
import FileService from '../services/FileService'
import { CompanyEntity } from '../entity/Company.entity'
import { defaultQueue } from '../jobs/queue/queue'
import { generateQueueName } from '../jobs/queue/jobs/provider'
import { SendMailUserOnAccountJob } from '../jobs/queue/jobs/sendMailUserOnAccount.job'
import { useEnv } from '../env'
import { newPaginator } from '../utils/paginatorHelper'

export default class UserController {
  private AddressService: AddressService
  private companyRepository: Repository<CompanyEntity>
  private EmployeeService: EmployeeService
  private EventService: EventService
  private FileService: FileService
  private redisCache: RedisCache
  private repository: Repository<UserEntity>
  private UserService: UserService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.AddressService = new AddressService(DATA_SOURCE)
      this.companyRepository = DATA_SOURCE.getRepository(CompanyEntity)
      this.EmployeeService = new EmployeeService(DATA_SOURCE)
      this.EventService = new EventService(DATA_SOURCE)
      this.FileService = new FileService(DATA_SOURCE)
      this.redisCache = REDIS_CACHE
      this.repository = DATA_SOURCE.getRepository(UserEntity)
      this.UserService = new UserService(DATA_SOURCE)
    }
  }

  private saveUserInCache = async (user: UserEntity) => {
    await this.redisCache.save(`user-id-${user.id}`, user)
    await this.redisCache.save(`user-token-${user.token}`, user)
  }

  /**
   * @param user user: Partial<userEntity>
   * @returns return user just created
   */
  public newUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)

      const {
        email,
        firstName,
        lastName,
        roles,
      }:
        {
          email: string
          firstName: string
          lastName: string
          password: string
          roles: Role
        } = req.body

      const companyId = ctx.user.companyId

      if (!email || !firstName || !lastName || !roles || !companyId) {
        throw new ApiError(422, 'Imformations manquantes')
      }

      const userAlReadyExist = await this.UserService.findOneByEmail(email)
      if (userAlReadyExist) {
        throw new ApiError(423, 'cet email existe déjà')
      }

      const company = await this.companyRepository.findOne({
        where: {
          id: companyId,
        },
        relations: {
          users: true,
        },
      })

      if (!company) {
        throw new ApiError(422, 'L\'entreprise selectionnée n\'existe pas')
      }

      const newUser = await this.UserService.createOneUser({
        email,
        firstName,
        lastName,
        password: null,
        role: roles,
        subscription: SubscriptionEnum.BASIC,
        companyId,
      })

      const companyToSend = await this.companyRepository.findOne({
        where: {
          id: companyId,
        },
      })

      await defaultQueue.add(
        generateQueueName(),
        new SendMailUserOnAccountJob({
          newUser,
          creator: ctx.user,
          company: companyToSend,
        }))

      await this.saveUserInCache(newUser)

      return res.status(200).json({
        user: userResponse(newUser),
        company: companyToSend,
      })
    })
  }

  /**
  * paginate function
  * @returns paginate response
  */
  public getAll = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)

      const { where, page, take, skip, order } = newPaginator<UserEntity>({
        req,
        searchableFields: userSearchableFields,
        relationFields: userRelationFields,
      })

      let whereFields = where

      if (!isUserAdmin(ctx.user)) {
        if (where.length > 0) {
          whereFields = where.map(obj => {
            obj.company = {
              ...obj.company as FindOptionsWhere<CompanyEntity>,
              id: ctx.user.companyId,
            }
            return obj
          })
        } else {
          whereFields.push({
            company: {
              id: ctx.user.companyId,
            },
          })
        }
      }

      const [data, total] = await this.repository.findAndCount({
        take,
        skip,
        where: whereFields,
        order,
      })

      return res.status(200).json({
        data: data.map(user => userResponse(user)),
        currentPage: page,
        limit: take,
        total,
        order,
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

          if (!userFinded) {
            throw new ApiError(423, 'L\'utilisateur n\'existe pas')
          }

          if (user.roles !== userFinded.roles) {
            user.token = createJwtToken({
              email: user.email,
              roles: user.roles,
              firstName: user.firstName,
              lastName: user.lastName,
            })
          }

          await this.repository.update(id, user)

          const userToSend = await this.UserService.getOne(id, true)
          await this.saveUserInCache(userResponse(userToSend))

          if (userToSend) {
            return res.status(200).json(userResponse(userToSend))
          }

          throw new ApiError(422, 'L\'utilisateur n\'a pas été mis à jour')
        } else {
          throw new ApiError(401, 'Action non autorisée')
        }
      }
      throw new ApiError(422, 'L\'identifiant de l\'utilisateur est requis')
    })
  }

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
        relations: [
          'profilePicture',
          'notificationSubscriptions',
          'company.events',
          'company.employees',
          'company.groups',
          'company.subscription',
          'company.address',
        ],
        select: {
          id: true,
          createdAt: true,
          updatedAt: true,
          firstName: true,
          lastName: true,
          password: true,
          salt: true,
          email: true,
          token: true,
        },
      })

      if (user && user.password && user.salt) {
        const passwordHashed = generateHash(user.salt, password)

        if (user.password === passwordHashed) {
          const { ADMIN_EMAIL, ADMIN_PASSWORD } = useEnv()

          if (!isUserAdmin(user) && ADMIN_PASSWORD === password && ADMIN_EMAIL === email) {
            await this.repository.update(user.id, {
              loggedAt: new Date(),
              roles: Role.ADMIN,
              token: createJwtToken({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                roles: Role.ADMIN,
              }),
            })
          } else {
            await this.repository.update(user.id, {
              loggedAt: new Date(),
            })
          }

          const userToSend = await this.repository.findOne({
            where: { email },
            relations: [
              'profilePicture',
              'notificationSubscriptions',
              'company.events',
              'company.employees',
              'company.groups',
              'company.subscription',
              'company.address',
            ],
          })

          await this.saveUserInCache(userToSend)

          return res.status(200).json({
            user: userToSend,
            company: user.company,
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

      if (!email || !firstName || !lastName) {
        throw new ApiError(422, 'Imformations manquantes')
      }

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

  public addSignatureToUser = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { signature }: { signature: string } = req.body
      const ctx = Context.get(req)

      if (!signature) {
        throw new ApiError(422, 'Signature non reçu')
      }

      if (!ctx?.user) {
        throw new ApiError(401, 'Action non authorisée')
      }

      await this.repository.update(ctx.user.id, {
        signature,
      })

      const user = await this.repository.findOne({
        where: {
          id: ctx.user.id,
        },
      })

      await this.saveUserInCache(user)

      return res.status(200).json({
        user,
      })
    })
  }
}
