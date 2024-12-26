import type { DataSource } from 'typeorm'
import type { BaseInterfaceRouter } from '../BaseRouter'
import { BaseRouter } from '../BaseRouter'
import { checkUserRole, idParamsSchema, isAuthenticated, updateCompanySubscription, useValidation } from '../../middlewares'
import { Role } from '../../types/Role'
import { SubscriptionAdminController } from '../../controllers/Admin/SubscriptionAdmin.controller'

const {
  validate,
} = useValidation()

export class AdminSubscriptionRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/:id', [validate(idParamsSchema), isAuthenticated], new SubscriptionAdminController(this.DATA_SOURCE).getOne)
    this.router.patch(
      '/',
      [
        validate(updateCompanySubscription),
        isAuthenticated,
        checkUserRole(Role.ADMIN),
      ],
      new SubscriptionAdminController(this.DATA_SOURCE).updateSubscription,
    )

    return this.router
  }
}
