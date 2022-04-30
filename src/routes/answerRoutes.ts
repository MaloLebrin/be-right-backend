import { Router } from 'express'
import AnswerController from '../controllers/AnswerController'
import isAuthenticated from '../middlewares/IsAuthenticated'

const router = Router()

router.get('/event/:id', isAuthenticated, AnswerController.getManyForEvent)

router.post('/', isAuthenticated, AnswerController.createOne)

router.post('/many', isAuthenticated, AnswerController.createMany)

router.patch('/', isAuthenticated, AnswerController.updateOne)

router.patch('/status', isAuthenticated, AnswerController.updateAnswerStatus)

router.delete('/:id', isAuthenticated, AnswerController.deleteOne)

export default router
