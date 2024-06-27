import type { DataSource } from 'typeorm'
import {
  isAuthenticated,
  payEventValidation,
  successfullPayment,
  useValidation,
} from '../../middlewares'
import { type BaseInterfaceRouter, BaseRouter } from '../BaseRouter'
import { StripeController } from '../../controllers/stripe/StripeController'

const {
  validate,
} = useValidation()

export class StripeSessionRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.post('/payEvent', [validate(payEventValidation), isAuthenticated], new StripeController(this.DATA_SOURCE).payEvent)
    this.router.get('/successfull/:sessionId', [validate(successfullPayment), isAuthenticated], new StripeController(this.DATA_SOURCE).successfull)

    return this.router
  }
}
