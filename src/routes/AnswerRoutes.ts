import type { DataSource } from 'typeorm'
import {
  createManyAnswersSchema,
  createOneAnswerSchema,
  doubleAuthSchema,
  getAnswerForEmployee,
  isAuthenticated,
  signeAnswerValidation,
  useValidation,
} from '../middlewares'
import { DownloadController } from '../controllers/DownloadController'
import { AnswerController } from '../controllers/AnswerController'
import { AnswerSpecificController } from '../controllers/employees/AnswerSpecificController'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

const {
  idParamsSchema,
  validate,
} = useValidation()

export class AnswerRoutes extends BaseRouter implements BaseInterfaceRouter {
  constructor(SOURCE: DataSource) { super(SOURCE) }

  public intializeRoutes = () => {
    this.router.get('/view', [isAuthenticated], new DownloadController(this.DATA_SOURCE).ViewAnswer)
    this.router.get('/download', [isAuthenticated], new DownloadController(this.DATA_SOURCE).downLoadAnswer)

    this.router.get('/manyByIds', [isAuthenticated], new AnswerController(this.DATA_SOURCE).getMany)
    this.router.get('/event/manyByIds', [isAuthenticated], new AnswerController(this.DATA_SOURCE).getManyForManyEvents)
    this.router.get('/event/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController(this.DATA_SOURCE).getManyForEvent)
    this.router.get('/raise/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController(this.DATA_SOURCE).raiseAnswer)

    // Answer For Employee
    this.router.patch('/signed/:id', [validate(signeAnswerValidation)], new AnswerSpecificController(this.DATA_SOURCE).updateAnswerByEmployee)
    this.router.post('/forSignature', [validate(getAnswerForEmployee)], new AnswerSpecificController(this.DATA_SOURCE).getOneAndSendCode)
    this.router.post('/checkDoubleAuth', [validate(doubleAuthSchema)], new AnswerSpecificController(this.DATA_SOURCE).checkTwoAuth)

    this.router.post('/', [validate(createOneAnswerSchema), isAuthenticated], new AnswerController(this.DATA_SOURCE).createOne)
    this.router.post('/many', [validate(createManyAnswersSchema), isAuthenticated], new AnswerController(this.DATA_SOURCE).createMany)

    this.router.patch('/', [isAuthenticated], new AnswerController(this.DATA_SOURCE).updateOne)
    this.router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController(this.DATA_SOURCE).deleteOne)

    return this.router
  }
}
