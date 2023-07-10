import type { DataSource, Repository } from 'typeorm'
import { In } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import csv from 'csvtojson'
import { BaseAdminController } from '../BaseAdminController'
import { wrapperRequest } from '../../../utils'
import type { GroupCreationPayload } from '../../../services/employee/GroupService'
import { GroupService } from '../../../services/employee/GroupService'
import { ApiError } from '../../../middlewares/ApiError'
import { uniq } from '../../../utils/arrayHelper'
import type { UploadCSVEmployee } from '../../../types/Employee'
import { EmployeeEntity } from '../../../entity/employees/EmployeeEntity'
import EmployeeService from '../../../services/employee/EmployeeService'
import { AddressService } from '../../../services'

export class AdminGroupController extends BaseAdminController {
  private groupService: GroupService
  private EmployeeRepository: Repository<EmployeeEntity>
  private EmployeeService: EmployeeService
  private AddressService: AddressService

  constructor(SOURCE: DataSource) {
    super(SOURCE)
    this.EmployeeRepository = SOURCE.getRepository(EmployeeEntity)
    this.groupService = new GroupService(SOURCE)
    this.AddressService = new AddressService(SOURCE)
    this.EmployeeService = new EmployeeService(SOURCE)
  }

  public createOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { group, companyId }: { group: GroupCreationPayload; companyId: number } = req.body

      if (!group || !companyId) {
        throw new ApiError(422, 'Parmètres manquants')
      }

      const newGroup = await this.groupService.createOne(group, companyId)

      if (newGroup) {
        return res.status(200).json(newGroup)
      }
      throw new ApiError(422, 'Le groupe n\'a pu être créé')
    })
  }

  public createOneWithCSV = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { name, description, companyId }: { name: string; description: string; companyId: number } = req.body

      const fileRecieved = req.file

      if (!name || !fileRecieved || !companyId) {
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
            id: companyId,
          },
        },
      })

      const newEmployeesToCreate = newEmployeesData.filter(newEmp => !existingEmployees.map(emp => emp.email).includes(newEmp.email))

      const arrayOfEmployeeIdsInGroup = [...existingEmployees.map(emp => emp.id)]

      if (newEmployeesToCreate.length > 0) {
        await Promise.all(
          newEmployeesToCreate.map(async emp => {
            const newOne = await this.EmployeeService.createOne({ ...emp }, companyId)
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
        }, companyId)

        if (newGroup) {
          return res.status(200).json(newGroup)
        }
      }

      throw new ApiError(422, 'Le groupe n\'a pu être créé')
    })
  }
}
