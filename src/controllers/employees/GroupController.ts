import type { NextFunction, Request, Response } from 'express'
import csv from 'csvtojson'
import type { DataSource, FindOptionsWhere, Repository } from 'typeorm'
import { In } from 'typeorm'
import { REDIS_CACHE } from '../..'
import { GroupEntity, groupRelationFields, groupSearchablefields } from '../../entity/employees/Group.entity'
import { ApiError } from '../../middlewares/ApiError'
import type { GroupCreationPayload } from '../../services/employee/GroupService'
import { GroupService } from '../../services/employee/GroupService'
import type { UploadCSVEmployee } from '../../types'
import { EntitiesEnum } from '../../types'
import { wrapperRequest } from '../../utils'
import { parseQueryIds } from '../../utils/basicHelper'
import { isUserAdmin } from '../../utils/userHelper'
import { EmployeeEntity } from '../../entity/employees/EmployeeEntity'
import EmployeeService from '../../services/employee/EmployeeService'
import { AddressService } from '../../services'
import { uniq } from '../../utils/arrayHelper'
import type RedisCache from '../../RedisCache'
import { generateRedisKey } from '../../utils/redisHelper'
import type { UserEntity } from '../../entity/UserEntity'
import { newPaginator } from '../../utils/paginatorHelper'
import { CompanyEntity } from '../../entity/Company.entity'

export class GroupController {
  private AddressService: AddressService
  private EmployeeService: EmployeeService
  private groupService: GroupService
  private EmployeeRepository: Repository<EmployeeEntity>
  private GroupRepository: Repository<GroupEntity>
  private redisCache: RedisCache
  private CompanyRepository: Repository<CompanyEntity>

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.groupService = new GroupService(DATA_SOURCE)
      this.EmployeeRepository = DATA_SOURCE.getRepository(EmployeeEntity)
      this.GroupRepository = DATA_SOURCE.getRepository(GroupEntity)
      this.CompanyRepository = DATA_SOURCE.getRepository(CompanyEntity)
      this.EmployeeService = new EmployeeService(DATA_SOURCE)
      this.AddressService = new AddressService(DATA_SOURCE)
      this.redisCache = REDIS_CACHE
    }
  }

  private invalidateUserInRedis = async (user: UserEntity) => {
    await Promise.all([
      this.redisCache.invalidate(generateRedisKey({
        id: user.id,
        typeofEntity: EntitiesEnum.USER,
        field: 'id',
      })),
      this.redisCache.invalidate(generateRedisKey({
        id: user.token,
        typeofEntity: EntitiesEnum.USER,
        field: 'token',
      })),
    ])
  }

  public createOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const { group }: { group: GroupCreationPayload } = req.body

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const currentUser = ctx.user

      if (!group || !currentUser) {
        throw new ApiError(422, 'Parmètres manquants')
      }

      const newGroup = await Promise.all([
        this.groupService.createOne(group, currentUser.companyId),
        this.invalidateUserInRedis(currentUser),
      ])

      if (newGroup) {
        return res.status(200).json(newGroup)
      }
      throw new ApiError(422, 'Le groupe n\'a pu être créé')
    })
  }

  public createOneWithCSV = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const { name, description }: { name: string; description: string } = req.body

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const fileRecieved = req.file

      const currentUser = ctx.user

      if (!name || !fileRecieved || !currentUser) {
        throw new ApiError(422, 'Parmètres manquants')
      }

      const newEmployeesData: UploadCSVEmployee[] = await csv().fromFile(fileRecieved.path)

      if (!newEmployeesData || newEmployeesData.length < 1) {
        throw new ApiError(422, 'Un problème est survenue avec votre csv')
      }

      const employeeEmails = newEmployeesData.map(emp => emp.email)

      const existingEmployees = await this.EmployeeRepository.find({
        where: {
          email: In(employeeEmails),
          company: {
            id: ctx.user.companyId,
          },
        },
      })

      const newEmployeesToCreate = newEmployeesData.filter(newEmp => !existingEmployees.map(emp => emp.email).includes(newEmp.email))

      const arrayOfEmployeeIdsInGroup = [...existingEmployees.map(emp => emp.id)]

      if (newEmployeesToCreate.length > 0) {
        await Promise.all(
          newEmployeesToCreate.map(async emp => {
            const newOne = await this.EmployeeService.createOne({ ...emp }, currentUser.companyId)
            await this.AddressService.createOne({
              address: {
                addressLine: emp.addressLine,
                postalCode: emp.postalCode,
                city: emp.city,
                country: emp.country,
              },
              employeeId: newOne.id,
            })
            return arrayOfEmployeeIdsInGroup.push(newOne.id)
          }),
        )
      }

      if (arrayOfEmployeeIdsInGroup.length > 0) {
        const newGroup = await Promise.all([
          this.groupService.createOne({
            name,
            description,
            employeeIds: uniq(arrayOfEmployeeIdsInGroup),
          }, currentUser.companyId),
          this.invalidateUserInRedis(currentUser),
        ])

        if (newGroup) {
          return res.status(200).json(newGroup)
        }
      }

      throw new ApiError(422, 'Le groupe n\'a pu être créé')
    })
  }

  public getOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const id = parseInt(req.params.id)

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const currentUser = ctx.user

      if (id && currentUser.id) {
        const employee = await this.groupService.getOne(id, currentUser.companyId)

        return res.status(200).json(employee)
      }
      throw new ApiError(422, 'identifiant du groupe manquant')
    })
  }

  public getMany = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const ids = req.query.ids as string

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      if (ids) {
        const groupIds = parseQueryIds(ids)

        if (groupIds?.length < 1) {
          throw new ApiError(422, 'identifiants des destinataires manquants')
        }

        const currentUser = ctx.user

        if (isUserAdmin(currentUser)) {
          const groups = await this.GroupRepository.find({
            where: { id: In(groupIds) },
          })

          return res.status(200).json(groups)
        }

        if (currentUser.companyId) {
          const groups = await this.groupService.getMany(groupIds, currentUser.companyId)

          return res.status(200).json(groups)
        }
      }
      throw new ApiError(422, 'identifiants des destinataires manquants')
    })
  }

  /**
   * @param id user id
   * @returns all groups from userId
   */
  public getManyByUserId = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const currentUser = ctx.user

      if (currentUser.companyId) {
        const employees = await this.groupService.getAllForUser(currentUser.companyId)

        return res.status(200).json(employees)
      }

      throw new ApiError(422, 'identifiant de l\'utilisateur manquant')
    })
  }

  public getManyByEmployeeId = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const currentUser = ctx.user
      const id = parseInt(req.params.id)

      if (!id) {
        throw new ApiError(422, 'identifiant du destinataire est manquant')
      }

      if (isUserAdmin(currentUser)) {
        const groups = await this.GroupRepository.find({
          where: {
            employees: {
              id,
            },
          },
          relations: {
            company: true,
            employees: true,
          },
        })
        return res.status(200).json(groups)
      } else if (currentUser.companyId) {
        const groups = await this.groupService.getAllForEmployee(id, currentUser.companyId)
        return res.status(200).json(groups)
      }
      throw new ApiError(401, 'Action non authorisée')
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

      const { where, page, take, skip, order } = newPaginator<GroupEntity>({
        req,
        searchableFields: groupSearchablefields,
        relationFields: groupRelationFields,
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

      const [groups, total] = await this.GroupRepository.findAndCount({
        take,
        skip,
        where: whereFields,
        order,
      })

      return res.status(200).json({
        data: groups,
        currentPage: page,
        totalPages: Math.ceil(total / take),
        limit: take,
        total,
        order,
      })
    })
  }

  /**
   * @param group group: Partial<GroupEntity>
   * @return return group just updated
   */
  public updateOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const { group }: { group: Partial<GroupEntity> } = req.body

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const id = parseInt(req.params.id)

      const currentUser = ctx.user

      let companyId: null | number = null

      if (isUserAdmin(ctx.user)) {
        const group = await this.GroupRepository.findOne({
          where: {
            id,
          },
        })
        companyId = group.companyId
      } else {
        companyId = currentUser.companyId
      }

      if (id && companyId) {
        const groupUpdated = await this.groupService.updateOne(id, companyId, group)

        return res.status(200).json(groupUpdated)
      }
      throw new ApiError(422, 'identifiant du destinataire manquant')
    })
  }

  public deleteOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async ctx => {
      const id = parseInt(req.params.id)

      if (!ctx) {
        throw new ApiError(500, 'Une erreur s\'est produite')
      }

      const user = ctx.user

      let companyId: null | number = null

      if (isUserAdmin(ctx.user)) {
        const group = await this.GroupRepository.findOne({
          where: {
            id,
          },
        })
        companyId = group.companyId
      } else {
        companyId = user.companyId
      }

      if (!id || !companyId) {
        throw new ApiError(422, 'identifiant du destinataire manquant')
      }
      const getGroupe = await this.groupService.getOne(id, companyId)

      if (getGroupe.companyId === user.companyId || isUserAdmin(user)) {
        await this.groupService.deleteOne(id)

        const company = await this.CompanyRepository.findOne({
          where: {
            id: getGroupe.companyId,
          },
          relations: {
            employees: true,
          },
        })

        const employees = company.employees
        delete company.employees

        return res.status(200).json({
          employees,
          company,
          group: getGroupe,
        })
      }
      throw new ApiError(401, 'Action non autorisée')
    })
  }
}
