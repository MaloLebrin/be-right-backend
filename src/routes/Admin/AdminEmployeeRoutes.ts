import type { DataSource } from 'typeorm'
import {
  checkUserRole,
  isAuthenticated,
  useValidation,
} from '../../middlewares'
import type { BaseInterfaceRouter } from '../BaseRouter'
import { BaseRouter } from '../BaseRouter'
import { Role } from '../../types/Role'
import { AdminEmployeeController } from '../../controllers/Admin/EmployeeController'
import { adminCreateEmployeeSchema } from '../../middlewares/validation/employeeValidation'

const {
  validate,
  idParamsSchema,
} = useValidation()

export class AdminEmployeeRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.post(
      '/',
      [validate(adminCreateEmployeeSchema), isAuthenticated, checkUserRole(Role.ADMIN)],
      new AdminEmployeeController(this.DATA_SOURCE).createOne,
    )

    this.router.delete('/deleteForEver/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new AdminEmployeeController(this.DATA_SOURCE).deleteForEver)

    return this.router
  }
}
