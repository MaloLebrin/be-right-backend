import 'reflect-metadata'
import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import multer from 'multer'
import Context from './context'
import { useLogger } from './middlewares/loggerService'
import { useEnv } from './env'
import { createAppSource } from './utils'
import { checkUserRole, isAuthenticated, useValidation } from './middlewares'
import { Role } from './types'
import NewsletterController from './controllers/NewsletterController'
import { AddresController } from './controllers/AddressController'
import AnswerController from './controllers/AnswerController'
import AuthController from './controllers/AuthController'
import BugReportController from './controllers/BugReportController'
import EmployeeController from './controllers/EmployeeController'
import EventController from './controllers/EventController'
import FileController from './controllers/FileController'
import UserController from './controllers/UserController'
import { seedersFunction } from './seed'
import RedisCache from './RedisCache'
import EventSpecificController from './controllers/EventSpecificController'
import { NotFoundError } from './middlewares/ApiError'
import { setupBullMqProcessor } from './jobs/queue/queue'

const {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  NODE_ENV,
  PORT,
  FRONT_URL,
} = useEnv()

export const APP_SOURCE = createAppSource()
export const REDIS_CACHE = new RedisCache()

async function StartApp() {
  const { loggerMiddleware, logger } = useLogger()

  await APP_SOURCE.initialize()
    .then(async () => {
      logger.info('Data Source has been initialized!')
    })
    .catch(err => {
      logger.error('Error during Data Source initialization:', err)
    })

  if (NODE_ENV === 'test') {
    logger.info('seeders started')
    await seedersFunction(APP_SOURCE)
    logger.info('seeders ended')
  }

  // Config workers and Queue
  await setupBullMqProcessor()

  const app = express()

  // Middlewares
  dotenv.config()
  app.use(cors({
    origin: NODE_ENV === 'production' ? FRONT_URL : '*',
    optionsSuccessStatus: 200,
  }))
  app.use(helmet())
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  app.use(loggerMiddleware)
  app.use((req: Request, res: Response, next: NextFunction) => {
    Context.bind(req)
    next()
  })

  cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  })

  app.get('/', (req: Request, res: Response) => {
    return res.send('Hello World')
  })

  const {
    idParamsSchema,
    emailAlreadyExistSchema,
    createAddressSchema,
    createManyAnswersSchema,
    createOneAnswerSchema,
    resetPasswordSchema,
    createbugSchema,
    createEmployeeSchema,
    createManyEmployeesSchema,
    createManyEmployeesOnEventSchema,
    createOneEventSchema,
    createPhotographerSchema,
    loginSchema,
    registerSchema,
    themeSchema,
    tokenSchema,
    validate,
  } = useValidation()

  // Newsletter
  app.get('/newsletter/', [isAuthenticated, checkUserRole(Role.ADMIN)], new NewsletterController().getAllPaginate)
  app.delete('/newsletter/:id', [validate(idParamsSchema), isAuthenticated], new NewsletterController().deleteOne)
  app.post('/newsletter/', [validate(emailAlreadyExistSchema)], new NewsletterController().createOne)

  // Address
  app.get('/address/manyByIds', [isAuthenticated], new AddresController().getMany)
  app.get('/address/:id', [validate(idParamsSchema), isAuthenticated], new AddresController().getOne)
  app.post('/address/', [validate(createAddressSchema), isAuthenticated], new AddresController().createOne)
  app.patch('/address/:id', [isAuthenticated], new AddresController().updateOne)
  app.delete('/address/:id', [validate(idParamsSchema), isAuthenticated], new AddresController().deleteOne)

  // Answer
  app.get('/answer/manyByIds', [isAuthenticated], new AnswerController().getMany)
  app.get('/answer/event/manyByIds', [isAuthenticated], new AnswerController().getManyForManyEvents)
  app.get('/answer/event/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController().getManyForEvent)
  app.post('/answer/', [validate(createOneAnswerSchema), isAuthenticated], new AnswerController().createOne)
  app.post('/answer/many', [validate(createManyAnswersSchema), isAuthenticated], new AnswerController().createMany)
  app.patch('/answer/', [isAuthenticated], new AnswerController().updateOne)
  app.patch('/answer/status/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController().updateAnswerStatus)
  app.delete('/answer/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController().deleteOne)

  // Auth
  app.post('/auth/forgot-password', [validate(emailAlreadyExistSchema)], new AuthController().forgotPassword)
  app.post('/auth/reset-password', [validate(resetPasswordSchema)], new AuthController().resetPassword)

  // Bug
  app.get('/bugreport/', [isAuthenticated], new BugReportController().getAll)
  app.get('/bugreport/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new BugReportController().getOne)
  app.post('/bugreport/', [validate(createbugSchema), isAuthenticated], new BugReportController().createOne)
  app.patch('/bugreport/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new BugReportController().updateOne)
  app.patch('/bugreport/status/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new BugReportController().updateStatus)
  app.delete('/bugreport/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new BugReportController().deleteOne)

  // Employee
  app.get('/employee/manyByIds', [isAuthenticated], new EmployeeController().getMany)
  app.get('/employee/', [isAuthenticated], new EmployeeController().getAll)
  app.get('/employee/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getOne)
  app.get('/employee/user/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getManyByUserId)
  app.get('/employee/event/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getManyByEventId)
  app.post('/employee/:id', [validate(createEmployeeSchema), isAuthenticated], new EmployeeController().createOne)
  app.post('/employee/many/:id', [validate(createManyEmployeesSchema), isAuthenticated], new EmployeeController().createMany)
  app.post('/employee/manyonevent/:eventId/:id', [validate(createManyEmployeesOnEventSchema), isAuthenticated], new EmployeeController().createManyEmployeeByEventId)
  app.put('/employee/updateTotalSignatureNeeded/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().patchOne)
  app.patch('/employee/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().updateOne)
  app.delete('/employee/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().deleteOne)

  // Event
  app.get('/event/many', [isAuthenticated], new EventController().getMany)
  app.get('/event/', [isAuthenticated], new EventController().getAll)
  app.get('/event/withRelations/:id', [validate(idParamsSchema), isAuthenticated], new EventSpecificController().fetchOneEventWithRelations)
  app.get('/event/:id', [validate(idParamsSchema), isAuthenticated], new EventController().getOne)
  app.post('/event/:id', [validate(createOneEventSchema), isAuthenticated], new EventController().createOne)
  app.get('/event/user/:id', [validate(idParamsSchema), isAuthenticated], new EventController().getAllForUser)
  app.patch('/event/:id', [validate(idParamsSchema), isAuthenticated], new EventController().updateOne)
  app.delete('/event/:id', [validate(idParamsSchema), isAuthenticated], new EventController().deleteOne)

  // File
  const upload = multer({ dest: 'uploads/' })
  app.get('/file/many', [isAuthenticated], new FileController().getFiles)
  app.post('/file/profile', [isAuthenticated], upload.single('file'), new FileController().createProfilePicture)
  app.post('/file/logo', [isAuthenticated], upload.single('file'), new FileController().createLogo)
  app.post('/file/:id', [isAuthenticated], upload.single('file'), new FileController().newFile)
  app.post('/file/getProfiles', [isAuthenticated], new FileController().getProfilePictures)
  app.patch('/file/:id', [isAuthenticated], new FileController().updateOne)
  app.get('/file/', [isAuthenticated], new FileController().getAllPaginate)
  app.get('/file/:id', [validate(idParamsSchema), isAuthenticated], new FileController().getFile)
  app.get('/file/user/:id', [isAuthenticated], new FileController().getFilesByUser)
  app.get('/file/event/:id', [isAuthenticated], new FileController().getFilesByEvent)
  app.delete('/file/:id', [validate(idParamsSchema), isAuthenticated], new FileController().deleteFile)

  // User
  app.get('/user/many', [isAuthenticated], new UserController().getMany)
  app.get('/user/', [isAuthenticated, checkUserRole(Role.ADMIN)], new UserController().getAll)
  app.get('/user/:id', [validate(idParamsSchema)], new UserController().getOne)
  app.get('/user/partners/:id', [validate(idParamsSchema), isAuthenticated], new UserController().getPhotographerAlreadyWorkWith)
  app.post('/user/token', [validate(tokenSchema)], new UserController().getOneByToken)
  app.post('/user/', [validate(registerSchema)], new UserController().newUser)
  app.post('/user/login', [validate(loginSchema)], new UserController().login)
  app.post('/user/photographer', [validate(createPhotographerSchema)], new UserController().createPhotographer)
  app.post('/user/isMailAlreadyExist', [validate(emailAlreadyExistSchema)], new UserController().isMailAlreadyUsed)
  app.patch('/user/:id', [isAuthenticated], new UserController().updateOne)
  app.patch('/user/theme/:id', [validate(themeSchema), isAuthenticated], new UserController().updateTheme)
  app.delete('/user/:id', [isAuthenticated], new UserController().deleteOne)
  app.patch('/user/subscription/:id', [checkUserRole(Role.ADMIN)], new UserController().updatesubscription)

  app.all('*', req => {
    throw new NotFoundError(req.path)
  })

  const port = PORT || 5555
  app.listen(port, '0.0.0.0', () => {
    logger.info(`Application is running in ${NODE_ENV} mode on port : ${port}`)
  })
}

StartApp()
