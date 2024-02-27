import type { DataSource } from 'typeorm'
import { isAuthenticated, useValidation } from '../middlewares'
import EventController from '../controllers/EventController'
import EventSpecificController from '../controllers/EventSpecificController'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

const {
  idParamsSchema,
  createOneEventSchema,
  validate,
} = useValidation()

export class EventRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/manyByIds', [isAuthenticated], new EventController(this.DATA_SOURCE).getMany)
    this.router.get('/', [isAuthenticated], new EventController(this.DATA_SOURCE).getAll)
    this.router.get('/calendar', [isAuthenticated], new EventController(this.DATA_SOURCE).getAllPeriod)
    this.router.get('/user', [isAuthenticated], new EventController(this.DATA_SOURCE).getAllForUser)
    this.router.get('/deleted', [isAuthenticated], new EventController(this.DATA_SOURCE).getAllDeletedForUser)
    this.router.get('/withRelations/:id', [validate(idParamsSchema), isAuthenticated], new EventSpecificController(this.DATA_SOURCE).fetchOneEventWithRelations)
    this.router.get('/:id', [validate(idParamsSchema), isAuthenticated], new EventController(this.DATA_SOURCE).getOne)
    this.router.post('', [validate(createOneEventSchema), isAuthenticated], new EventSpecificController(this.DATA_SOURCE).posteOneWithRelations)
    this.router.patch('/:id', [validate(idParamsSchema), isAuthenticated], new EventController(this.DATA_SOURCE).updateOne)
    this.router.patch('/synchronise/:id', [validate(idParamsSchema), isAuthenticated], new EventController(this.DATA_SOURCE).synchroniseOne)
    this.router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new EventController(this.DATA_SOURCE).deleteOne)

    return this.router
  }
}
