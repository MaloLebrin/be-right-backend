import { Router } from 'express'
import EventController from '../controllers/EventController'
import isAuthenticated from '../middlewares/IsAuthenticated'
const router = Router()

router.get('/many', [isAuthenticated], EventController.getMany)

router.get('/', [isAuthenticated], EventController.getAll)

router.get('/:id', [isAuthenticated], EventController.getOne)

router.post('/:id', [isAuthenticated], EventController.createOne)

router.get('/user/:id', [isAuthenticated], EventController.getAllForUser)

router.patch('/:id', [isAuthenticated], EventController.updateOne)

router.delete('/:id', [isAuthenticated], EventController.deleteOne)

// router.get('/clear', EventController.clear)

export default router