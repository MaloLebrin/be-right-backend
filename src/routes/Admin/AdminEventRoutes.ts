import type { DataSource } from 'typeorm'
import { checkUserRole, isAuthenticated } from '../../middlewares'
import { Role } from '../../types'
import type { BaseInterfaceRouter } from '../BaseRouter'
import { BaseRouter } from '../BaseRouter'
import EventController from '../../controllers/EventController'

// const {
//   idParamsSchema,
//   validate,
// } = useValidation()

export class AdminEventRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], new EventController(this.DATA_SOURCE).getAll)
    // this.router.delete('/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new UserController(this.DATA_SOURCE).deleteOne)
    // this.router.patch('/:id', [validate(patchUserSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new UserController(this.DATA_SOURCE).updateOne)

    return this.router
  }
}
