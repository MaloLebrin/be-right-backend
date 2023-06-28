import type { DataSource } from 'typeorm'
import { StripeProductController } from '../controllers/stripe/StripeProductController'
import { useValidation } from '../middlewares'
import { productIdParamsValidation } from '../middlewares/validation/stripe/productValidation'
import { StripeSubscriptionController } from '../controllers/stripe/StripeSubscriptionController'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

const { validate } = useValidation()

export class PaymentsRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/products', new StripeProductController().getProducts)
    this.router.post('/productAmount', [validate(productIdParamsValidation)], new StripeProductController().getAmountForProduct)

    this.router.get('/subscription', new StripeSubscriptionController(this.DATA_SOURCE).getSubscriptions)
    // this.router.post('/subscription', new StripeSubscriptionController().)

    return this.router
  }
}
