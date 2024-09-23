import type { DataSource } from 'typeorm'
import { type BaseInterfaceRouter, BaseRouter } from '../BaseRouter'
import { StripeWebhookController } from '../../controllers/stripe/StripeWebhookController'

export class StripeWebHooksRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.post(
      '/webhook',
      [],
      new StripeWebhookController(this.DATA_SOURCE).events,
    )
    return this.router
  }
}
