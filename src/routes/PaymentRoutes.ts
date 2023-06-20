import type { DataSource } from 'typeorm'
import { StripeProductController } from '../controllers/stripe/StripeProductController'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

export class PaymentsRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/products', new StripeProductController().getProducts)
    return this.router
  }
}
