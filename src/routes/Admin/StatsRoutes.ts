import type { DataSource } from 'typeorm'
import { AdminStatsController } from '../../controllers/Admin/StatsController'
import { checkUserRole, isAuthenticated } from '../../middlewares'
import { Role } from '../../types'
import type { BaseInterfaceRouter } from '../BaseRouter'
import { BaseRouter } from '../BaseRouter'

export class StatsRouter extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get(
      '/stats',
      [isAuthenticated, checkUserRole(Role.ADMIN)],
      new AdminStatsController(this.DATA_SOURCE).statsHome,
    )

    return this.router
  }
}
