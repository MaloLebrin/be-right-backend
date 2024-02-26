import type { DataSource } from 'typeorm'
import { isAuthenticated } from '../../middlewares'
import { StripeCustomerController } from '../../controllers/stripe/StripeCustomerController'
import { type BaseInterfaceRouter, BaseRouter } from '../BaseRouter'

export class StripeCustomerRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/getByUserId', [isAuthenticated], new StripeCustomerController(this.DATA_SOURCE).getCustomerByUser)

    return this.router
  }
}
