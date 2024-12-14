import type { DataSource } from 'typeorm'
import { checkUserRole, isAuthenticated, useValidation } from '../../middlewares'
import { Role } from '../../types'
import type { BaseInterfaceRouter } from '../BaseRouter'
import { BaseRouter } from '../BaseRouter'
import UserController from '../../controllers/UserController'
import { UserDeleteController } from '../../controllers/user/UserDeleteController'

const {
  idParamsSchema,
  patchUserSchema,
  validate,
} = useValidation()

export class AdminUserRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], new UserController(this.DATA_SOURCE).getAll)

    this.router.get('/restore/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new UserController(this.DATA_SOURCE).restoreOne)

    this.router.delete('/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new UserController(this.DATA_SOURCE).deleteOne)

    this.router.delete('/deleteForEver/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new UserDeleteController(this.DATA_SOURCE).deleteForEver)

    this.router.patch('/:id', [validate(patchUserSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new UserController(this.DATA_SOURCE).updateOne)

    return this.router
  }
}
