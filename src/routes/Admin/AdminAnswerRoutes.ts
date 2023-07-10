import type { DataSource } from 'typeorm'
import {
  AdminCreateManyAnswersSchema,
  checkUserRole,
  isAuthenticated,
  useValidation,
} from '../../middlewares'
import type { BaseInterfaceRouter } from '../BaseRouter'
import { BaseRouter } from '../BaseRouter'
import { AdminAnswerController } from '../../controllers/Admin/employees/AnswerController'
import { Role } from '../../types/Role'

const {
  validate,
} = useValidation()

export class AdminAnswerRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.post(
      '/many',
      [validate(AdminCreateManyAnswersSchema), isAuthenticated, checkUserRole(Role.ADMIN)],
      new AdminAnswerController(this.DATA_SOURCE).createMany,
    )

    return this.router
  }
}
