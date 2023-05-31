import type { Request, Response } from 'express'
import csv from 'csvtojson'
import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import { REDIS_CACHE } from '../..'
import Context from '../../context'
import { GroupEntity, groupSearchablefields } from '../../entity/employees/Group.entity'
import { ApiError } from '../../middlewares/ApiError'
import type { GroupCreationPayload } from '../../services/employee/GroupService'
import { GroupService } from '../../services/employee/GroupService'
import type { UploadCSVEmployee } from '../../types'
import { EntitiesEnum } from '../../types'
import { paginator, wrapperRequest } from '../../utils'
import { parseQueryIds } from '../../utils/basicHelper'
import { isUserAdmin } from '../../utils/userHelper'
import { EmployeeEntity } from '../../entity/employees/EmployeeEntity'
import EmployeeService from '../../services/employee/EmployeeService'
import { AddressService } from '../../services'
import { uniq } from '../../utils/arrayHelper'
import type RedisCache from '../../RedisCache'
import { generateRedisKey } from '../../utils/redisHelper'
import type { UserEntity } from '../../entity/UserEntity'

export class GroupController {
  AddressService: AddressService
  EmployeeService: EmployeeService
  groupService: GroupService
  EmployeeRepository: Repository<EmployeeEntity>
  GroupRepository: Repository<GroupEntity>
  redisCache: RedisCache

  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.groupService = new GroupService(DATA_SOURCE)
      this.EmployeeRepository = DATA_SOURCE.getRepository(EmployeeEntity)
      this.GroupRepository = DATA_SOURCE.getRepository(GroupEntity)
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

  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { group }: { group: GroupCreationPayload } = req.body

      const ctx = Context.get(req)
      const currentUser = ctx.user

      if (!group || !currentUser) {
        throw new ApiError(422, 'Parmètres manquants')
      }

      const newGroup = await this.groupService.createOne(group, currentUser.companyId)

      if (newGroup) {
        await this.invalidateUserInRedis(currentUser)
        return res.status(200).json(newGroup)
      }
      throw new ApiError(422, 'Le groupe n\'a pu être créé')
    })
  }

  public createOneWithCSV = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { name, description }: { name: string; description: string } = req.body

      const fileRecieved = req.file

      const ctx = Context.get(req)
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
        const newGroup = await this.groupService.createOne({
          name,
          description,
          employeeIds: uniq(arrayOfEmployeeIdsInGroup),
        }, currentUser.companyId)

        if (newGroup) {
          await this.invalidateUserInRedis(currentUser)
          return res.status(200).json(newGroup)
        }
      }

      throw new ApiError(422, 'Le groupe n\'a pu être créé')
    })
  }

  public getOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      const ctx = Context.get(req)
      const currentUser = ctx.user

      if (id && currentUser.id) {
        const employee = await this.groupService.getOne(id, currentUser.companyId)

        return res.status(200).json(employee)
      }
      throw new ApiError(422, 'identifiant du groupe manquant')
    })
  }

  public getMany = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ids = req.query.ids as string

      if (ids) {
        const groupIds = parseQueryIds(ids)

        const ctx = Context.get(req)
        const currentUser = ctx.user

        if (groupIds?.length > 0 && currentUser.companyId) {
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
  public getManyByUserId = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)
      const currentUser = ctx.user

      if (currentUser.companyId) {
        const employees = await this.groupService.getAllForUser(currentUser.companyId)

        return res.status(200).json(employees)
      }

      throw new ApiError(422, 'identifiant de l\'utilisateur manquant')
    })
  }

  public getManyByEmployeeId = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)
      const currentUser = ctx.user
      const id = parseInt(req.params.id)

      if (id && currentUser.companyId) {
        const employees = await this.groupService.getAllForEmployee(id, currentUser.companyId)
        return res.status(200).json(employees)
      }
      throw new ApiError(422, 'identifiant de l\'utilisateur manquant')
    })
  }

  /**
   * paginate function
   * @returns paginate response
   */
  public getAll = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const ctx = Context.get(req)

      const { where, page, take, skip } = paginator<GroupEntity>(req, groupSearchablefields)

      const whereFields = {
        ...where,
      }

      if (!isUserAdmin(ctx.user)) {
        whereFields.company = {
          id: ctx.user.companyId,
        }
      }

      const [groups, total] = await this.GroupRepository.findAndCount({
        take,
        skip,
        where: whereFields,
      })

      return res.status(200).json({
        data: groups,
        currentPage: page,
        limit: take,
        total,
      })
    })
  }

  /**
   * @param group group: Partial<GroupEntity>
   * @return return group just updated
   */
  public updateOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { group }: { group: Partial<GroupEntity> } = req.body

      const id = parseInt(req.params.id)

      const ctx = Context.get(req)
      const currentUser = ctx.user

      if (id && currentUser.companyId) {
        const groupUpdated = await this.groupService.updateOne(id, currentUser.companyId, group)

        return res.status(200).json(groupUpdated)
      }
      throw new ApiError(422, 'identifiant du destinataire manquant')
    })
  }

  public deleteOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const id = parseInt(req.params.id)

      const ctx = Context.get(req)
      const user = ctx.user

      if (id && user?.id) {
        const getGroupe = await this.groupService.getOne(id, user.id)

        if (getGroupe.companyId === user.companyId || isUserAdmin(user)) {
          await this.groupService.deleteOne(id)

          return res.status(204).json(getGroupe)
        }
        throw new ApiError(401, 'Action non autorisée')
      }
      throw new ApiError(422, 'identifiant du destinataire manquant')
    })
  }
}
