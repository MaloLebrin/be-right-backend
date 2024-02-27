import type { DataSource } from 'typeorm'
import { isAuthenticated, useValidation } from '../../middlewares'
import { type BaseInterfaceRouter, BaseRouter } from '../BaseRouter'
import { NotificationSubscriptionController } from '../../controllers/notifications/NotificationSubscription.Controller'

const {
  idParamsSchema,
  subscribeNotification,
  validate,
} = useValidation()

export class NotificationSubscriptionRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('', [isAuthenticated], new NotificationSubscriptionController(this.DATA_SOURCE).GetForUser)

    this.router.patch('/unsuscbribe/:id', [validate(idParamsSchema), isAuthenticated], new NotificationSubscriptionController(this.DATA_SOURCE).unsuscbribe)

    this.router.post('/suscbribe', [validate(subscribeNotification), isAuthenticated], new NotificationSubscriptionController(this.DATA_SOURCE).subscribe)

    return this.router
  }
}
