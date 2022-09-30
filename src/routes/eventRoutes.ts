import { Router } from 'express'
import EventController from '../controllers/EventController'
import { isAuthenticated, useValidation } from '../middlewares'

const router = Router()

const {
  idParamsSchema,
  createOneEventSchema,
  validate,
} = useValidation()

router.get('/many', [isAuthenticated], EventController.getMany)

router.get('/', [isAuthenticated], EventController.getAll)

router.get('/:id', [validate(idParamsSchema), isAuthenticated], EventController.getOne)

router.post('/:id', [validate(createOneEventSchema), isAuthenticated], EventController.createOne)

router.get('/user/:id', [validate(idParamsSchema), isAuthenticated], EventController.getAllForUser)

router.patch('/:id', [validate(idParamsSchema), isAuthenticated], EventController.updateOne)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], EventController.deleteOne)

// router.get('/clear', EventController.clear)

export default router
