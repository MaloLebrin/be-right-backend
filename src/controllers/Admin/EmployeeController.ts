import type { DataSource, Repository } from 'typeorm'
import type { Request, Response } from 'express'
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
import { BaseAdminController } from './BaseAdminController'

export class AdminEmployeeController extends BaseAdminController {
  private EmployeeService: EmployeeService
  private AddressService: AddressService
  private employeeRepository: Repository<EmployeeEntity>

  constructor(SOURCE: DataSource) {
    super(SOURCE)
    this.EmployeeService = new EmployeeService(SOURCE)
    this.AddressService = new AddressService(SOURCE)
    this.employeeRepository = SOURCE.getRepository(EmployeeEntity)
  }

  /**
   * employee must have event id
   * @param employee employee: Partial<employeeEntity>
   * @returns return employee just created
   */
  public createOne = async (req: Request, res: Response) => {
    await wrapperRequest(req, res, async () => {
      const { employee, address, userId }: EmployeeCreateOneRequest & { userId: number } = req.body

      if (!employee || !address || !userId) {
        throw new ApiError(422, 'Paramètres manquants')
      }

      const isEmployeeAlreadyExist = await this.employeeRepository.exist({
        where: {
          email: employee.email,
        },
      })

      if (isEmployeeAlreadyExist) {
        throw new ApiError(423, 'cet email existe déjà')
      }

      const newEmployee = await this.EmployeeService.createOne(employee, userId)

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
}
