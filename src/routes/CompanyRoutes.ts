import type { DataSource } from 'typeorm'
import { CompanyController } from '../controllers/CompanyController'
import { checkUserRole, isAuthenticated, useValidation } from '../middlewares'
import { Role } from '../types/Role'
import { BaseRouter } from './BaseRouter'
import type { BaseInterfaceRouter } from './BaseRouter'

const {
  idParamsSchema,
  validate,
} = useValidation()

export class CompanyRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/manyByIds', [isAuthenticated, checkUserRole([Role.ADMIN])], new CompanyController(this.DATA_SOURCE).getMany)
    this.router.get('/:id', [validate(idParamsSchema), isAuthenticated], new CompanyController(this.DATA_SOURCE).getOne)
    this.router.patch('/owners/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole([Role.ADMIN, Role.OWNER])], new CompanyController(this.DATA_SOURCE).addOrRemoveOwner)
    this.router.patch('/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole([Role.ADMIN, Role.OWNER])], new CompanyController(this.DATA_SOURCE).patchOne)

    return this.router
  }
}
