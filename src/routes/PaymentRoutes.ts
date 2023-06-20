import type { DataSource } from 'typeorm'
import { StripeProductController } from '../controllers/stripe/StripeProductController'
import { useValidation } from '../middlewares'
import { productIdParamsValidation } from '../middlewares/validation/stripe/productValidation'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

const { validate } = useValidation()

export class PaymentsRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/products', new StripeProductController().getProducts)
    this.router.post('/productAmount', [validate(productIdParamsValidation)], new StripeProductController().getAmountForProduct)

    return this.router
  }
}
