import type { DataSource } from 'typeorm'
import {
  isAuthenticated,
  useValidation,
} from '../middlewares'
import AuthController from '../controllers/AuthController'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

const {
  emailAlreadyExistSchema,
  resetPasswordSchema,
  registerSchema,
  validate,
} = useValidation()

export class AuthRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.post('/forgot-password', [validate(emailAlreadyExistSchema)], new AuthController(this.DATA_SOURCE).forgotPassword)
    this.router.post('/reset-password', [validate(resetPasswordSchema)], new AuthController(this.DATA_SOURCE).resetPassword)
    this.router.post('/signup', [validate(registerSchema)], new AuthController(this.DATA_SOURCE).signUp)
    this.router.post('/logout', [isAuthenticated], new AuthController(this.DATA_SOURCE).logOut)

    return this.router
  }
}
