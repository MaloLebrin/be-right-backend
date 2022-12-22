import { Router } from 'express'
import { useValidation } from '../middlewares'
import AnswerController from '../controllers/AnswerController'
import isAuthenticated from '../middlewares/IsAuthenticated'

const router = Router()

const {
  idParamsSchema,
  createManyAnswersSchema,
  createOneAnswerSchema,
  updateAnswerStatusSchema,
  validate,
} = useValidation()

router.get('/event/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController().getManyForEvent)

router.post('/', [validate(createOneAnswerSchema), isAuthenticated], new AnswerController().createOne)

router.post('/many', [validate(createManyAnswersSchema), isAuthenticated], new AnswerController().createMany)

router.patch('/', [isAuthenticated], new AnswerController().updateOne)

router.patch('/status', [validate(updateAnswerStatusSchema), isAuthenticated], new AnswerController().updateAnswerStatus)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController().deleteOne)

export default router
