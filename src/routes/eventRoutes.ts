import { Router } from 'express'
import EventController from '../controllers/EventController'
import { isAuthenticated, useValidation } from '../middlewares'

const router = Router()

const {
  idParamsSchema,
  createOneEventSchema,
  validate,
} = useValidation()

router.get('/many', [isAuthenticated], new EventController().getMany)

router.get('/', [isAuthenticated], new EventController().getAll)

router.get('/:id', [validate(idParamsSchema), isAuthenticated], new EventController().getOne)

router.post('/:id', [validate(createOneEventSchema), isAuthenticated], new EventController().createOne)

router.get('/user/:id', [validate(idParamsSchema), isAuthenticated], new EventController().getAllForUser)

router.patch('/:id', [validate(idParamsSchema), isAuthenticated], new EventController().updateOne)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new EventController().deleteOne)

// router.get('/clear', new EventController().clear)

export default router
