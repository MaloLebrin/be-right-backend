import type { DataSource } from 'typeorm'
import {
  checkUserRole,
  isAuthenticated,
  useValidation,
} from '../../middlewares'
import type { BaseInterfaceRouter } from '../BaseRouter'
import { BaseRouter } from '../BaseRouter'
import { Role } from '../../types/Role'
import { AdminCompanyController } from '../../controllers/Admin/CompanyController'

const {
  idParamsSchema,
  validate,
} = useValidation()

export class AdminCompanyRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.delete('/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole([Role.ADMIN])], new AdminCompanyController(this.DATA_SOURCE).deleteCompany)

    return this.router
  }
}
