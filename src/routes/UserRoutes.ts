import type { DataSource } from 'typeorm'
import { checkUserRole, isAuthenticated, useValidation } from '../middlewares'
import { Role } from '../types'
import UserController from '../controllers/UserController'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

const {
  createPhotographerSchema,
  emailAlreadyExistSchema,
  idParamsSchema,
  loginSchema,
  newUserSchema,
  patchUserSchema,
  tokenSchema,
  validate,
} = useValidation()

export class UserRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/many', [isAuthenticated], new UserController(this.DATA_SOURCE).getMany)
    this.router.get('/partners', [isAuthenticated], new UserController(this.DATA_SOURCE).getPhotographerAlreadyWorkWith)
    this.router.get('/:id', [validate(idParamsSchema)], new UserController(this.DATA_SOURCE).getOne)
    this.router.post('/token', [validate(tokenSchema)], new UserController(this.DATA_SOURCE).getOneByToken)
    this.router.post('/', [validate(newUserSchema), isAuthenticated, checkUserRole([Role.ADMIN, Role.OWNER])], new UserController(this.DATA_SOURCE).newUser)
    this.router.post('/login', [validate(loginSchema)], new UserController(this.DATA_SOURCE).login)
    this.router.post('/photographer', [validate(createPhotographerSchema)], new UserController(this.DATA_SOURCE).createPhotographer)
    this.router.post('/isMailAlreadyExist', [validate(emailAlreadyExistSchema)], new UserController(this.DATA_SOURCE).isMailAlreadyUsed)
    this.router.patch('/:id', [validate(patchUserSchema), isAuthenticated], new UserController(this.DATA_SOURCE).updateOne)
    this.router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new UserController(this.DATA_SOURCE).deleteOne)

    return this.router
  }
}
