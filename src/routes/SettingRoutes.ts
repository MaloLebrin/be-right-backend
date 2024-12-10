import type { DataSource } from 'typeorm'
import { isAuthenticated, updateUserSetting, useValidation } from '../middlewares'
import { SettingController } from '../controllers/SettingController'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

const {
  validate,
} = useValidation()

export class SettingRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/', [isAuthenticated], new SettingController(this.DATA_SOURCE).getOne)

    this.router.patch('/', [validate(updateUserSetting), isAuthenticated], new SettingController(this.DATA_SOURCE).patchOne)

    return this.router
  }
}
