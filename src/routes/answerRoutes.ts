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

router.get('/event/:id', [validate(idParamsSchema), isAuthenticated], AnswerController.getManyForEvent)

router.post('/', [validate(createOneAnswerSchema), isAuthenticated], AnswerController.createOne)

router.post('/many', [validate(createManyAnswersSchema), isAuthenticated], AnswerController.createMany)

router.patch('/', [isAuthenticated], AnswerController.updateOne)

router.patch('/status', [validate(updateAnswerStatusSchema), isAuthenticated], AnswerController.updateAnswerStatus)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], AnswerController.deleteOne)

export default router
