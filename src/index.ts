import 'reflect-metadata'
import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import multer from 'multer'
import Context from './context'
import { logger } from './middlewares/loggerService'
import { useEnv } from './env'
import { createAppSource } from './utils'
import {
  checkUserRole,
  createManyAnswersSchema,
  createOneAnswerSchema,
  doubleAuthSchema,
  getAnswerForEmployee,
  isAuthenticated,
  signeAnswerValidation,
  useValidation,
} from './middlewares'
import { Role } from './types'
import NewsletterController from './controllers/NewsletterController'
import { AddresController } from './controllers/AddressController'
import AnswerController from './controllers/AnswerController'
import AuthController from './controllers/AuthController'
import BugReportController from './controllers/BugReportController'
import EmployeeController from './controllers/employees/EmployeeController'
import EventController from './controllers/EventController'
import FileController from './controllers/FileController'
import UserController from './controllers/UserController'
import { seedersFunction } from './seed'
import RedisCache from './RedisCache'
import EventSpecificController from './controllers/EventSpecificController'
import { NotFoundError } from './middlewares/ApiError'
import { MailController } from './controllers/MailController'
import { setupBullMqProcessor } from './jobs/queue/queue'
import NotificationController from './controllers/Notifications.controller'
import { NotificationSubscriptionController } from './controllers/notifications/NotificationSubscription.Controller'
import { SSEManager } from './serverSendEvent/SSEManager'
import { GroupController } from './controllers/employees/GroupController'
import { CompanyController } from './controllers/CompanyController'
import { BadgeController } from './controllers/repositories/BadgeController'
import { AnswerSpecificController } from './controllers/employees/AnswerSpecificController'
import { isProduction } from './utils/envHelper'
import DownloadController from './controllers/DownloadController'
import { hbs } from './utils/handlebarsHelper'
import downloadAuth from './middlewares/downloadAuth'
import { cronJobsStart } from './jobs'

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
  app.use(helmet())
  app.use(cors({
    origin: isProduction() ? FRONT_URL : '*',
    optionsSuccessStatus: 200,
  }))
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))
  // app.use(loggerMiddleware)

  app.use((req: Request, res: Response, next: NextFunction) => {
    Context.bind(req)
    next()
  })
  app.set('sseManager', new SSEManager())

  app.engine('handlebars', hbs.engine)
  app.set('view engine', 'handlebars')
  app.set('views', '/app/src/views')

  cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  })

  const upload = multer({ dest: 'src/uploads/' })

  app.get('/', (req: Request, res: Response) => {
    return res.send('Hello World')
  })

  const {
    createAddressSchema,
    createbugSchema,
    createEmployeeSchema,
    createGroupSchema,
    createManyEmployeesOnEventSchema,
    createManyEmployeesSchema,
    createOneEventSchema,
    createPhotographerSchema,
    emailAlreadyExistSchema,
    idParamsSchema,
    loginSchema,
    newUserSchema,
    patchAddressSchema,
    patchUserSchema,
    registerSchema,
    resetPasswordSchema,
    subscribeNotification,
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
  app.patch('/address/:id', [validate(patchAddressSchema), isAuthenticated], new AddresController().updateOne)
  app.delete('/address/:id', [validate(idParamsSchema), isAuthenticated], new AddresController().deleteOne)

  // Answer
  app.get('/answer/view', [isAuthenticated], new DownloadController().ViewAnswer)
  app.get('/answer/download', [downloadAuth], new DownloadController().downLoadAnswer)

  app.get('/answer/manyByIds', [isAuthenticated], new AnswerController().getMany)
  app.get('/answer/event/manyByIds', [isAuthenticated], new AnswerController().getManyForManyEvents)
  app.get('/answer/event/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController().getManyForEvent)
  app.get('/answer/raise/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController().raiseAnswer)
  app.post('/answer/', [validate(createOneAnswerSchema), isAuthenticated], new AnswerController().createOne)
  app.post('/answer/many', [validate(createManyAnswersSchema), isAuthenticated], new AnswerController().createMany)
  app.patch('/answer/', [isAuthenticated], new AnswerController().updateOne)
  app.delete('/answer/:id', [validate(idParamsSchema), isAuthenticated], new AnswerController().deleteOne)

  // Answer For Employee
  app.patch('/answer/signed/:id', [validate(signeAnswerValidation)], new AnswerSpecificController().updateAnswerByEmployee)
  app.post('/answer/forSignature', [validate(getAnswerForEmployee)], new AnswerSpecificController().getOne)
  app.post('/answer/checkDoubleAuth', [validate(doubleAuthSchema)], new AnswerSpecificController().checkTwoAuth)

  // Auth
  app.post('/auth/forgot-password', [validate(emailAlreadyExistSchema)], new AuthController().forgotPassword)
  app.post('/auth/reset-password', [validate(resetPasswordSchema)], new AuthController().resetPassword)
  app.post('/auth/signup', [validate(registerSchema)], new AuthController().signUp)

  // Badge
  app.get('/badges', [isAuthenticated], new BadgeController().getAll)
  app.get('/badges/user', [isAuthenticated], new BadgeController().getAllForUser)

  // Bug
  app.get('/bugreport/', [isAuthenticated], new BugReportController().getAll)
  app.get('/bugreport/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new BugReportController().getOne)
  app.post('/bugreport/', [validate(createbugSchema), isAuthenticated], new BugReportController().createOne)
  app.patch('/bugreport/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new BugReportController().updateOne)
  app.patch('/bugreport/status/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new BugReportController().updateStatus)
  app.delete('/bugreport/:id', [validate(idParamsSchema), isAuthenticated, checkUserRole(Role.ADMIN)], new BugReportController().deleteOne)

  // Company
  app.get('/company/:id', [isAuthenticated], new CompanyController().getOne)
  app.patch('/company/owners/:id', [isAuthenticated, checkUserRole([Role.ADMIN, Role.OWNER])], new CompanyController().addOrRemoveOwner)
  app.patch('/company/:id', [isAuthenticated, checkUserRole([Role.ADMIN, Role.OWNER])], new CompanyController().patchOne)

  // Employee
  app.get('/employee/manyByIds', [isAuthenticated], new EmployeeController().getMany)
  app.get('/employee/', [isAuthenticated], new EmployeeController().getAll)
  app.get('/employee/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getOne)
  app.get('/employee/user/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getManyByUserId)
  app.get('/employee/event/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getManyByEventId)
  app.post('/employee', [validate(createEmployeeSchema), isAuthenticated], new EmployeeController().createOne)
  app.post('/employee/many', [validate(createManyEmployeesSchema), isAuthenticated], new EmployeeController().createMany)
  app.post('/employee/manyonevent/:eventId/:id', [validate(createManyEmployeesOnEventSchema), isAuthenticated], new EmployeeController().createManyEmployeeByEventId)
  app.post('/employee-upload/csv', [isAuthenticated], upload.single('file'), new EmployeeController().uploadFormCSV)
  app.put('/employee/updateTotalSignatureNeeded/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().patchOne)
  app.patch('/employee/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().updateOne)
  app.delete('/employee/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().deleteOne)

  // Event
  app.get('/event/manyByIds', [isAuthenticated], new EventController().getMany)
  app.get('/event/', [isAuthenticated], new EventController().getAll)
  app.get('/event/user', [isAuthenticated], new EventController().getAllForUser)
  app.get('/event/deleted', [isAuthenticated], new EventController().getAllDeletedForUser)
  app.get('/event/withRelations/:id', [validate(idParamsSchema), isAuthenticated], new EventSpecificController().fetchOneEventWithRelations)
  app.get('/event/:id', [validate(idParamsSchema), isAuthenticated], new EventController().getOne)
  app.post('/event', [validate(createOneEventSchema), isAuthenticated], new EventSpecificController().posteOneWithRelations)
  app.patch('/event/:id', [validate(idParamsSchema), isAuthenticated], new EventController().updateOne)
  app.delete('/event/:id', [validate(idParamsSchema), isAuthenticated], new EventController().deleteOne)

  // File
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

  // Group
  app.get('/group/manyByIds', [isAuthenticated], new GroupController().getMany)
  app.get('/group/user', [isAuthenticated], new GroupController().getManyByUserId)
  app.get('/group/employeeId/:id', [validate(idParamsSchema), isAuthenticated], new GroupController().getManyByEmployeeId)
  app.get('/group/:id', [validate(idParamsSchema), isAuthenticated], new GroupController().getOne)
  app.post('/group', [validate(createGroupSchema), isAuthenticated], new GroupController().createOne)
  app.post('/group/csv', [isAuthenticated], upload.single('file'), new GroupController().createOneWithCSV)
  app.patch('/group/:id', [validate(idParamsSchema), isAuthenticated], new GroupController().updateOne)
  app.delete('/group/:id', [validate(idParamsSchema), isAuthenticated], new GroupController().deleteOne)

  // Mail
  app.get('/mail/answer/:id', [validate(idParamsSchema), isAuthenticated], new MailController().sendMailToEmployee)

  // Notification
  app.get('/notifications', [isAuthenticated], new NotificationController().GetForUser)
  app.get('/notifications/sse', new NotificationController().streamNotifications)
  app.patch('/notifications/readMany', [isAuthenticated], new NotificationController().readMany)

  // Notification Subscriptions
  app.get('/notificationSubscription', [isAuthenticated], new NotificationSubscriptionController().GetForUser)
  app.patch('/notificationSubscription/unsuscbribe/:id', [validate(idParamsSchema), isAuthenticated], new NotificationSubscriptionController().unsuscbribe)
  app.post('/notificationSubscription/suscbribe', [validate(subscribeNotification), isAuthenticated], new NotificationSubscriptionController().subscribe)

  // User
  app.get('/user/many', [isAuthenticated], new UserController().getMany)
  app.get('/user/partners', [isAuthenticated], new UserController().getPhotographerAlreadyWorkWith)
  app.get('/user/', [isAuthenticated, checkUserRole(Role.ADMIN)], new UserController().getAll)
  app.get('/user/:id', [validate(idParamsSchema)], new UserController().getOne)
  app.post('/user/token', [validate(tokenSchema)], new UserController().getOneByToken)
  app.post('/user', [validate(newUserSchema), isAuthenticated, checkUserRole([Role.ADMIN, Role.OWNER])], new UserController().newUser)
  app.post('/user/login', [validate(loginSchema)], new UserController().login)
  app.post('/user/photographer', [validate(createPhotographerSchema)], new UserController().createPhotographer)
  app.post('/user/isMailAlreadyExist', [validate(emailAlreadyExistSchema)], new UserController().isMailAlreadyUsed)
  app.patch('/user/:id', [validate(patchUserSchema), isAuthenticated], new UserController().updateOne)
  app.delete('/user/:id', [validate(idParamsSchema), isAuthenticated], new UserController().deleteOne)

  app.all('*', req => {
    throw new NotFoundError(req.path)
  })

  const port = PORT || 5555
  app.listen(port, '0.0.0.0', () => {
    if (isProduction()) {
      logger.warn('⚠️ CAUTION your are in prod Mode ⚠️')
    }
    logger.info(`Application is running in ${NODE_ENV} mode on port : ${port}`)
  })
}

StartApp()
cronJobsStart()
