import type { DataSource } from 'typeorm'
import { checkUserRole, isAuthenticated } from '../../middlewares'
import { Role } from '../../types'
import type { BaseInterfaceRouter } from '../BaseRouter'
import { BaseRouter } from '../BaseRouter'
import { GroupController } from '../../controllers/employees/GroupController'

export class AdminGroupRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], new GroupController(this.DATA_SOURCE).getAll)

    return this.router
  }
}
