/* eslint-disable @typescript-eslint/indent */
import type { NextFunction, Request, Response } from 'express'
import type { DataSource, FindOptionsWhere, Repository } from 'typeorm'
import { generateHash, wrapperRequest } from '../utils'
import { UserEntity, userRelationFields, userSearchableFields } from '../entity/UserEntity'
import { Role } from '../types/Role'
import { SubscriptionEnum } from '../types/Subscription'
import UserService from '../services/user/UserService'
import { createJwtToken, generateRedisKey, isUserAdmin, uniqByKey, userResponse } from '../utils/'
import type { RedisKeys } from '../types'
import { EntitiesEnum } from '../types'
import { REDIS_CACHE } from '..'
import type RedisCache from '../RedisCache'
import { ApiError } from '../middlewares/ApiError'
import { AddressService, EventDeleteService, SettingService } from '../services'
import EmployeeService from '../services/employee/EmployeeService'
import FileService from '../services/FileService'
import { CompanyEntity } from '../entity/Company.entity'
import { defaultQueue } from '../jobs/queue/queue'
import { generateQueueName } from '../jobs/queue/jobs/provider'
import { SendMailUserOnAccountJob } from '../jobs/queue/jobs/sendMailUserOnAccount.job'
import { useEnv } from '../env'
import { newPaginator } from '../utils/paginatorHelper'
import { CreateUserService } from '../services/user'

export default class UserController {
  private AddressService: AddressService
  private companyRepository: Repository<CompanyEntity>
  private EmployeeService: EmployeeService
  private EventDeleteService: EventDeleteService
  private FileService: FileService
  private redisCache: RedisCache
  private repository: Repository<UserEntity>
  private SettingService: SettingService
  private UserService: UserService
  private CreateUserService: CreateUserService

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.AddressService = new AddressService(DATA_SOURCE)
      this.companyRepository = DATA_SOURCE.getRepository(CompanyEntity)
      this.EmployeeService = new EmployeeService(DATA_SOURCE)
      this.EventDeleteService = new EventDeleteService(DATA_SOURCE)
      this.FileService = new FileService(DATA_SOURCE)
      this.redisCache = REDIS_CACHE
      this.repository = DATA_SOURCE.getRepository(UserEntity)
      this.UserService = new UserService(DATA_SOURCE)
      this.SettingService = new SettingService(DATA_SOURCE)
      this.CreateUserService = new CreateUserService(DATA_SOURCE)
    }
  }

  private saveUserInCache = async (user: UserEntity) => {
    await Promise.all([
      this.redisCache.save(`user-id-${user.id}`, user),
      this.redisCache.save(`user-token-${user.token}`, user),
    ])
  }

  /**
   * @param user user: Partial<userEntity>
   * @returns return user just created
   */
  public newUser = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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

      const newUser = await this.CreateUserService.createOneUser({
        email,
        firstName,
        lastName,
        password: null,
        role: roles,
        subscription: SubscriptionEnum.BASIC,
        companyId,
      })

      const [companyToSend] = await Promise.all([
        this.companyRepository.findOne({
          where: {
            id: companyId,
          },
        }),
        this.SettingService.createDefaultOneForUser(newUser.id),
      ])

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
  public getAll = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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
        withDeleted: isUserAdmin(ctx.user),
      })

      return res.status(200).json({
        data: data.map(user => userResponse(user)),
        currentPage: page,
        limit: take,
        totalPages: Math.ceil(total / take),
        total,
        order,
      })
    })
  }

  /**
   * @param Id number
   * @returns entity form given id
  */
  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
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

  public getMany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
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

  public getOneByToken = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const token = req.body.token

      if (token) {
        const user = await this.redisCache.get<UserEntity>(
          `user-token-${token}`,
          () => this.UserService.getByToken(token, true))

        if (user) {
          await this.repository.update(user.id, {
            loggedAt: new Date(),
          })

          const [company, settings] = await Promise.all([
            this.companyRepository.findOne({
              where: { id: user.companyId },
              relations: {
                address: true,
                employees: true,
                events: true,
                files: true,
                subscription: true,
                users: true,
              },
            }),
            this.SettingService.getOneByUserId(user.id),
          ])

          return res.status(200).json({
            user: userResponse(user),
            company,
            settings,
            subcription: company.subscription,
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
  public updateOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const { user }: { user: Partial<UserEntity> } = req.body
      const id = parseInt(req.params.id)

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (id) {
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

  public deleteOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const id = parseInt(req.params.id)
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (id === ctx.user.id || isUserAdmin(ctx.user)) {
        const userToDelete = await this.UserService.getOne(id, true)

        if (!userToDelete) {
          throw new ApiError(422, 'L\'utilisateur n\'éxiste pas')
        }

        if (userToDelete.company.addressId) {
          await Promise.all([
            this.AddressService.softDelete(userToDelete.company.addressId),
            this.SettingService.deleteOneByUserId(id),

            this.redisCache.invalidate(generateRedisKey({
              typeofEntity: EntitiesEnum.ADDRESS,
              field: 'id',
              id: userToDelete.company.addressId,
            })),
          ])
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
            await this.EventDeleteService.softDeleteOneAndRelations(event)
          }))
        }

        if (userToDelete.company.filesIds?.length > 0) {
          await this.FileService.deleteManyfiles(userToDelete.company.filesIds)
        }

        const [userDeleted] = await Promise.all([
          this.repository.softDelete(id),
          this.redisCache.invalidate(`user-id-${id}`),
        ])

        if (userDeleted) {
          return res.status(204).json(userDeleted)
        }

        throw new ApiError(422, 'Utilisateur non supprimé')
      } else {
        throw new ApiError(401, 'Action non autorisée')
      }
    })
  }

  public login = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
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
          roles: true,
        },
      })

      if (!user || !user.password || !user.salt) {
        throw new ApiError(404, 'Utilisateur non trouvé')
      }

      const passwordHashed = generateHash(user.salt, password)

      if (user.password !== passwordHashed) {
        throw new ApiError(401, 'Identifiant et/ou mot de passe incorrect')
      }

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

      const [userToSend, settings] = await Promise.all([
        this.repository.findOne({
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
        }),
        this.SettingService.getOneByUserId(user.id),
      ])

      this.redisCache.save(`user-notification-${user.notificationToken}`, {
        id: user.id,
        notificationToken: user.notificationToken,
      })

      return res.status(200).json({
        user: userToSend,
        company: user.company,
        settings,
        subscription: userToSend.company.subscription,
      })
    })
  }

  public createPhotographer = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { email, firstName, lastName }: { email: string; firstName: string; lastName: string } = req.body

      if (!email || !firstName || !lastName) {
        throw new ApiError(422, 'Imformations manquantes')
      }

      const newPhotographer = await this.UserService.createPhotographer({ email, firstName, lastName })
      await this.SettingService.createDefaultOneForUser(newPhotographer.id)

      return res.status(200).json(newPhotographer)
    })
  }

  public getPhotographerAlreadyWorkWith = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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

  public isMailAlreadyUsed = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
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

  public addSignatureToUser = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const { signature }: { signature: string } = req.body
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

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

  public restoreOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)
      if (!id) {
        throw new ApiError(422, 'Paramètre manquant')
      }

      await Promise.all([
        this.repository.restore(id),
        this.SettingService.restoreOneByUserId(id),
      ])
      const user = await this.UserService.getOne(id)

      return res.status(200).json(userResponse(user))
    })
  }
}
