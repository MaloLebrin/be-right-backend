import type { DataSource } from 'typeorm'
import { checkUserRole, isAuthenticated, useValidation } from '../../middlewares'
import { Role } from '../../types'
import type { BaseInterfaceRouter } from '../BaseRouter'
import { BaseRouter } from '../BaseRouter'
import { GroupController } from '../../controllers/employees/GroupController'

const {
  idParamsSchema,
  validate,
} = useValidation()

export class AdminGroupRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], new GroupController(this.DATA_SOURCE).getAll)
    this.router.patch('/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new GroupController(this.DATA_SOURCE).updateOne)
    // this.router.post('/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new GroupController(this.DATA_SOURCE).updateOne)

    return this.router
  }
}
