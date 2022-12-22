import { Router } from 'express'
import { useValidation } from '../middlewares'
import { AddresController } from '../controllers/AddressController'
import isAuthenticated from '../middlewares/IsAuthenticated'

const router = Router()

const {
  idParamsSchema,
  createAddressSchema,
  validate,
} = useValidation()

router.get('/:id', [validate(idParamsSchema), isAuthenticated], new AddresController().getOne)

// router.get('/event/:id', [validate(idParamsSchema), isAuthenticated], new AddresController().getOneByEvent)

// router.get('/user/:id', [validate(idParamsSchema), isAuthenticated], new AddresController().getOneByUser)

// router.get('/employee/:id', [validate(idParamsSchema), isAuthenticated], new AddresController().getOneByEmployee)

router.post('/', [validate(createAddressSchema), isAuthenticated], new AddresController().createOne)

router.patch('/:id', [isAuthenticated], new AddresController().updateOne)

router.delete('/:id', [validate(idParamsSchema), isAuthenticated], new AddresController().deleteOne)

export default router
