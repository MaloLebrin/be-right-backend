import type { DataSource } from 'typeorm'
import { isAuthenticated, useValidation } from '../middlewares'
import { AddresController } from '../controllers/AddressController'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

const {
  createAddressSchema,
  idParamsSchema,
  patchAddressSchema,
  validate,
} = useValidation()

export class AddressRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/manyByIds', [isAuthenticated], new AddresController(this.DATA_SOURCE).getMany)
    this.router.get('/:id', [validate(idParamsSchema), isAuthenticated], new AddresController(this.DATA_SOURCE).getOne)
    this.router.post('/', [validate(createAddressSchema), isAuthenticated], new AddresController(this.DATA_SOURCE).createOne)
    this.router.patch('/:id', [validate(patchAddressSchema), isAuthenticated], new AddresController(this.DATA_SOURCE).updateOne)
    this.router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new AddresController(this.DATA_SOURCE).deleteOne)

    return this.router
  }
}
