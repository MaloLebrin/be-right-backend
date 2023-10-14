import type { DataSource, Repository } from 'typeorm'
import type { NextFunction, Request, Response } from 'express'
import { AddressService } from '../../services/AddressService'
import { EmployeeEntity } from '../../entity/employees/EmployeeEntity'
import EmployeeService from '../../services/employee/EmployeeService'
import { CreateEmployeeNotificationsJob } from '../../jobs/queue/jobs/createEmployeeNotifications.job'
import { generateQueueName } from '../../jobs/queue/jobs/provider'
import { defaultQueue } from '../../jobs/queue/queue'
import { ApiError } from '../../middlewares/ApiError'
import type { EmployeeCreateOneRequest } from '../../types'
import { NotificationTypeEnum } from '../../types'
import { wrapperRequest } from '../../utils'
import { CompanyEntity } from '../../entity/Company.entity'
import { BaseAdminController } from './BaseAdminController'

export class AdminEmployeeController extends BaseAdminController {
  private EmployeeService: EmployeeService
  private AddressService: AddressService
  private employeeRepository: Repository<EmployeeEntity>
  private CompanyRepository: Repository<CompanyEntity>

  constructor(SOURCE: DataSource) {
    super(SOURCE)
    this.EmployeeService = new EmployeeService(SOURCE)
    this.AddressService = new AddressService(SOURCE)
    this.employeeRepository = SOURCE.getRepository(EmployeeEntity)
    this.CompanyRepository = SOURCE.getRepository(CompanyEntity)
  }

  /**
   * employee must have event id
   * @param employee employee: Partial<employeeEntity>
   * @returns return employee just created
   */
  public createOne = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const { employee, address, userId }: EmployeeCreateOneRequest & { userId: number } = req.body

      if (!employee || !address || !userId) {
        throw new ApiError(422, 'Paramètres manquants')
      }

      const company = await this.CompanyRepository.findOne({
        where: {
          users: {
            id: userId,
          },
        },
      })

      if (!company) {
        throw new ApiError(422, 'Entreprise non trounée')
      }

      const isEmployeeAlreadyExist = await this.employeeRepository.exist({
        where: {
          email: employee.email,
        },
      })

      if (isEmployeeAlreadyExist) {
        throw new ApiError(423, 'cet email existe déjà')
      }

      const newEmployee = await this.EmployeeService.createOne(employee, company.id)

      if (!newEmployee) {
        throw new ApiError(422, 'Une erreur s\'est produite')
      }

      await this.AddressService.createOne({
        address,
        employeeId: newEmployee.id,
      })

      await defaultQueue.add(
        generateQueueName(NotificationTypeEnum.EMPLOYEE_CREATED),
        new CreateEmployeeNotificationsJob({
          type: NotificationTypeEnum.EMPLOYEE_CREATED,
          employees: [newEmployee],
          userId,
        }))

      const employeeToSend = await this.EmployeeService.getOne(newEmployee.id)

      return res.status(200).json(employeeToSend)
    })
  }

  public deleteForEver = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const id = parseInt(req.params.id)
      if (!id) {
        throw new ApiError(422, 'Paramètre manquant')
      }

      await this.employeeRepository.delete(id)
      return res.status(204).json('destinataire supprimé')
    })
  }
}
