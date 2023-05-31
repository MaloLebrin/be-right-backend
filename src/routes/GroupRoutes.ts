import type { DataSource } from 'typeorm'
import multer from 'multer'
import { isAuthenticated, useValidation } from '../middlewares'
import { GroupController } from '../controllers/employees/GroupController'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

const {
  createGroupSchema,
  idParamsSchema,
  validate,
} = useValidation()

const upload = multer({ dest: 'src/uploads/' })

export class GroupRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/manyByIds', [isAuthenticated], new GroupController(this.DATA_SOURCE).getMany)
    this.router.get('/user', [isAuthenticated], new GroupController(this.DATA_SOURCE).getManyByUserId)
    this.router.get('/employeeId/:id', [validate(idParamsSchema), isAuthenticated], new GroupController(this.DATA_SOURCE).getManyByEmployeeId)
    this.router.get('/:id', [validate(idParamsSchema), isAuthenticated], new GroupController(this.DATA_SOURCE).getOne)
    this.router.post('', [validate(createGroupSchema), isAuthenticated], new GroupController(this.DATA_SOURCE).createOne)
    this.router.post('/csv', [isAuthenticated], upload.single('file'), new GroupController(this.DATA_SOURCE).createOneWithCSV)
    this.router.patch('/:id', [validate(idParamsSchema), isAuthenticated], new GroupController(this.DATA_SOURCE).updateOne)
    this.router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new GroupController(this.DATA_SOURCE).deleteOne)

    return this.router
  }
}
