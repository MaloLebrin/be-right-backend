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
    this.router.get('/event/manyByIds', [isAuthenticated], new EventController(this.DATA_SOURCE).getMany)
    this.router.get('/event/', [isAuthenticated], new EventController(this.DATA_SOURCE).getAll)
    this.router.get('/event/user', [isAuthenticated], new EventController(this.DATA_SOURCE).getAllForUser)
    this.router.get('/event/deleted', [isAuthenticated], new EventController(this.DATA_SOURCE).getAllDeletedForUser)
    this.router.get('/event/withRelations/:id', [validate(idParamsSchema), isAuthenticated], new EventSpecificController(this.DATA_SOURCE).fetchOneEventWithRelations)
    this.router.get('/event/:id', [validate(idParamsSchema), isAuthenticated], new EventController(this.DATA_SOURCE).getOne)
    this.router.post('/event', [validate(createOneEventSchema), isAuthenticated], new EventSpecificController(this.DATA_SOURCE).posteOneWithRelations)
    this.router.patch('/event/:id', [validate(idParamsSchema), isAuthenticated], new EventController(this.DATA_SOURCE).updateOne)
    this.router.delete('/event/:id', [validate(idParamsSchema), isAuthenticated], new EventController(this.DATA_SOURCE).deleteOne)

    return this.router
  }
}
