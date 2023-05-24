import type { DataSource } from 'typeorm'
import { checkUserRole, isAuthenticated, useValidation } from '../middlewares'
import { Role } from '../types'
import { NewsletterController } from '../controllers/NewsletterController'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

const {
  emailAlreadyExistSchema,
  idParamsSchema,
  validate,
} = useValidation()

export class NewsletterRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get(
      '/',
      [isAuthenticated, checkUserRole(Role.ADMIN)],
      new NewsletterController(this.DATA_SOURCE).getAllPaginate,
    )

    this.router.delete(
      '/:id',
      [validate(idParamsSchema), isAuthenticated],
      new NewsletterController(this.DATA_SOURCE).deleteOne,
    )

    this.router.post('/',
      [validate(emailAlreadyExistSchema)],
      new NewsletterController(this.DATA_SOURCE).createOne,
    )

    return this.router
  }
}
