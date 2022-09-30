import { Router } from 'express'
import UserController from '../controllers/UserController'
import { Role } from '../types/Role'
import { checkUserRole, isAuthenticated, useValidation } from '../middlewares'

const router = Router()

const {
  createPhotographerSchema,
  emailAlreadyExistSchema,
  idParamsSchema,
  loginSchema,
  registerSchema,
  themeSchema,
  tokenSchema,
  validate,
} = useValidation()

router.get('/many', [isAuthenticated], UserController.getMany)

router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], UserController.getAll)

router.get('/:id', [validate(idParamsSchema)], UserController.getOne)

router.get('/partners/:id', [validate(idParamsSchema), isAuthenticated], UserController.getPhotographerAlreadyWorkWith)

router.post('/token', [validate(tokenSchema)], UserController.getOneByToken)

router.post('/', [validate(registerSchema)], UserController.newUser)

router.post('/login', [validate(loginSchema)], UserController.login)

router.post('/photographer', [validate(createPhotographerSchema)], UserController.createPhotographer)

router.post('/isMailAlreadyExist', [validate(emailAlreadyExistSchema)], UserController.isMailAlreadyUsed)

router.patch('/:id', [isAuthenticated], UserController.updateOne)

router.patch('/theme/:id', [validate(themeSchema), isAuthenticated], UserController.updateTheme)

router.delete('/:id', [isAuthenticated], UserController.deleteOne)

router.patch('/subscription/:id', [checkUserRole(Role.ADMIN)], UserController.updatesubscription)

// router.get('/clear', UserController.clear)

export default router
