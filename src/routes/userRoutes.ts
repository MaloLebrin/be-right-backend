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

router.get('/many', [isAuthenticated], new UserController().getMany)

router.get('/', [isAuthenticated, checkUserRole(Role.ADMIN)], new UserController().getAll)

router.get('/:id', [validate(idParamsSchema)], new UserController().getOne)

router.get('/partners/:id', [validate(idParamsSchema), isAuthenticated], new UserController().getPhotographerAlreadyWorkWith)

router.post('/token', [validate(tokenSchema)], new UserController().getOneByToken)

router.post('/', [validate(registerSchema)], new UserController().newUser)

router.post('/login', [validate(loginSchema)], new UserController().login)

router.post('/photographer', [validate(createPhotographerSchema)], new UserController().createPhotographer)

router.post('/isMailAlreadyExist', [validate(emailAlreadyExistSchema)], new UserController().isMailAlreadyUsed)

router.patch('/:id', [isAuthenticated], new UserController().updateOne)

router.patch('/theme/:id', [validate(themeSchema), isAuthenticated], new UserController().updateTheme)

router.delete('/:id', [isAuthenticated], new UserController().deleteOne)

router.patch('/subscription/:id', [checkUserRole(Role.ADMIN)], new UserController().updatesubscription)

// router.get('/clear', new UserController().clear)

export default router
