import type { DataSource } from 'typeorm'
import { isAuthenticated } from '../../middlewares'
import { type BaseInterfaceRouter, BaseRouter } from '../BaseRouter'
import NotificationController from '../../controllers/Notifications.controller'

export class NotificationRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('', [isAuthenticated], new NotificationController(this.DATA_SOURCE).GetForUser)
    this.router.patch('/readMany', [isAuthenticated], new NotificationController(this.DATA_SOURCE).readMany)

    return this.router
  }
}
