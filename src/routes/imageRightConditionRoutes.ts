import { Router } from 'express'
import ImageRightConditionController from '../controllers/ImageRightConditionController'
import isAuthenticated from '../middlewares/IsAuthenticated'
const router = Router()

router.get('/', [isAuthenticated], ImageRightConditionController.getMany)

router.get('/:id', [isAuthenticated], ImageRightConditionController.getOne)

router.post('/', [isAuthenticated], ImageRightConditionController.createOne)

router.get('/event/:id', [isAuthenticated], ImageRightConditionController.getAllForEventById)

router.patch('/:id', [isAuthenticated], ImageRightConditionController.updateOne)

router.delete('/:id', [isAuthenticated], ImageRightConditionController.deleteOne)

// router.get('/clear', EventController.clear)

export default router