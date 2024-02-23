import 'reflect-metadata'
import path from 'node:path'
import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import multer from 'multer'
import { createChannel } from 'better-sse'
import Context from './context'
import { logger } from './middlewares/loggerService'
import { useEnv } from './env'
import { createAppSource } from './utils'
import {
  isAuthenticated,
  useValidation,
} from './middlewares'
import EmployeeController from './controllers/employees/EmployeeController'
import FileController from './controllers/FileController'
import { seedersFunction } from './seed'
import RedisCache from './RedisCache'
import { NotFoundError } from './middlewares/ApiError'
import { MailController } from './controllers/MailController'
import { setupBullMqProcessor } from './jobs/queue/queue'
import { BadgeController } from './controllers/repositories/BadgeController'
import { isProduction } from './utils/envHelper'
import { hbs } from './utils/handlebarsHelper'
import { cronJobsStart } from './jobs'
import { StatsRouter } from './routes/Admin/StatsRoutes'
import { AddressRoutes } from './routes/AddressRoutes'
import { AnswerRoutes } from './routes/AnswerRoutes'
import { AuthRoutes } from './routes/AuthRoutes'
import { UserRoutes } from './routes/UserRoutes'
import { AdminUserRoutes } from './routes/Admin/AdminUserRoutes'
import { AdminGroupRoutes } from './routes/Admin/AdminGroupRoutes'
import { GroupRoutes } from './routes/GroupRoutes'
import { EventRoutes } from './routes/EventRoutes'
import { AdminEventRoutes } from './routes/Admin/AdminEventRoutes'
import { AdminAnswerRoutes } from './routes/Admin/AdminAnswerRoutes'
import { AdminEmployeeRoutes } from './routes/Admin/AdminEmployeeRoutes'
import { CompanyRoutes } from './routes/CompanyRoutes'
import { AdminCompanyRoutes } from './routes/Admin/AdminCompanyRoutes'
import { errorHandler } from './middlewares/ErrorHandler'
import { MigrationRunner } from './migrations/config/MigrationRunner'
import { MigrationRepository } from './migrations/config/MigrationRepository'
import { NotificationRoutes, NotificationSubscriptionRoutes } from './routes/Notifications'
import { SSERoutes } from './routes/SSERoutes'
dotenv.config()

const {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  NODE_ENV,
  PORT,
  FRONT_URL,
  REDIS_PASSWORD,
  REDIS_HOST,
  REDIS_PORT,
} = useEnv()

export const APP_SOURCE = createAppSource()
export const REDIS_CACHE = new RedisCache({ REDIS_PORT: parseInt(REDIS_PORT), REDIS_HOST, REDIS_PASSWORD })

async function StartAPI() {
  await APP_SOURCE.initialize()

  if (APP_SOURCE.isInitialized) {
    logger.info('Data Source has been initialized!')
  } else {
    logger.error('Error during Data Source initialization:')
  }

  await MigrationRunner({
    APP_SOURCE,
    MigrationRepository,
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

  app.engine('handlebars', hbs.engine)
  app.set('view engine', 'handlebars')
  app.set('views', path.join(__dirname, 'views'))
  app.use(express.static('public'))

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
    createEmployeeSchema,
    createManyEmployeesOnEventSchema,
    createManyEmployeesSchema,
    idParamsSchema,
    validate,
  } = useValidation()

  // Admin
  app.use('/admin/answer', new AdminAnswerRoutes(APP_SOURCE).intializeRoutes())
  app.use('/admin/company', new AdminCompanyRoutes(APP_SOURCE).intializeRoutes())
  app.use('/admin/employee', new AdminEmployeeRoutes(APP_SOURCE).intializeRoutes())
  app.use('/admin/event', new AdminEventRoutes(APP_SOURCE).intializeRoutes())
  app.use('/admin/group', new AdminGroupRoutes(APP_SOURCE).intializeRoutes())
  app.use('/admin/stats', new StatsRouter(APP_SOURCE).intializeRoutes())
  app.use('/admin/user', new AdminUserRoutes(APP_SOURCE).intializeRoutes())

  // Address
  app.use('/address', new AddressRoutes(APP_SOURCE).intializeRoutes())

  // Answer
  app.use('/answer', new AnswerRoutes(APP_SOURCE).intializeRoutes())

  // Auth
  app.use('/auth', new AuthRoutes(APP_SOURCE).intializeRoutes())

  // Badge
  app.get('/badges', [isAuthenticated], new BadgeController().getAll)
  app.get('/badges/user', [isAuthenticated], new BadgeController().getAllForUser)

  // Company
  app.use('/company', new CompanyRoutes(APP_SOURCE).intializeRoutes())

  // Employee
  app.get('/employee/manyByIds', [isAuthenticated], new EmployeeController().getMany)
  app.get('/employee/', [isAuthenticated], new EmployeeController().getAll)
  app.get('/employee/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getOne)
  app.get('/employee/user/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getManyByUserId)
  app.get('/employee/event/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().getManyByEventId)
  app.get('/employee/restore/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().restoreOne)
  app.post('/employee', [validate(createEmployeeSchema), isAuthenticated], new EmployeeController().createOne)
  app.post('/employee/many', [validate(createManyEmployeesSchema), isAuthenticated], new EmployeeController().createMany)
  app.post('/employee/manyonevent/:eventId/:id', [validate(createManyEmployeesOnEventSchema), isAuthenticated], new EmployeeController().createManyEmployeeByEventId)
  app.post('/employee-upload/csv', [isAuthenticated], upload.single('file'), new EmployeeController().uploadFormCSV)
  app.put('/employee/updateTotalSignatureNeeded/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().patchOne)
  app.patch('/employee/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().updateOne)
  app.delete('/employee/:id', [validate(idParamsSchema), isAuthenticated], new EmployeeController().deleteOne)

  // Event
  app.use('/event', new EventRoutes(APP_SOURCE).intializeRoutes())

  // File
  app.get('/file/many', [isAuthenticated], new FileController().getFiles)
  app.post('/file/profile', [isAuthenticated], upload.single('file'), new FileController().createProfilePicture)
  app.post('/file/logo', [isAuthenticated], upload.single('file'), new FileController().createLogo)
  app.post('/file/:id', [isAuthenticated], upload.single('file'), new FileController().newFile)
  app.post('/file/getProfiles', [isAuthenticated], new FileController().getProfilePictures)
  app.patch('/file/:id', [isAuthenticated], new FileController().updateOne)
  app.get('/file/:id', [validate(idParamsSchema), isAuthenticated], new FileController().getFile)
  app.get('/file/user/:id', [isAuthenticated], new FileController().getFilesByUser)
  app.get('/file/event/:id', [isAuthenticated], new FileController().getFilesByEvent)
  app.delete('/file/:id', [validate(idParamsSchema), isAuthenticated], new FileController().deleteFile)

  // Group
  app.use('/group', new GroupRoutes(APP_SOURCE).intializeRoutes())

  // Mail
  app.get('/mail/answer/:id', [validate(idParamsSchema), isAuthenticated], new MailController().sendMailToEmployee)

  const notificationChannel = createChannel()

  app.use('/sse', new SSERoutes(APP_SOURCE, {
    notificationChannel,
  }).intializeRoutes())

  // Notification
  app.use('/notifications', new NotificationRoutes(APP_SOURCE).intializeRoutes())

  // Notification Subscriptions
  app.use('/notificationSubscription', new NotificationSubscriptionRoutes(APP_SOURCE).intializeRoutes())

  // User
  app.use('/user', new UserRoutes(APP_SOURCE).intializeRoutes())

  app.all('*', req => {
    throw new NotFoundError(req.path)
  })

  app.use(errorHandler)

  const port = PORT || 5555
  app.listen(port, '0.0.0.0', () => {
    if (isProduction()) {
      logger.warn('⚠️ CAUTION your are in prod Mode ⚠️')
    }
    logger.info(`Application is running in ${NODE_ENV} mode on port : ${port}`)
  })
}

async function startApp() {
  await StartAPI()
  await cronJobsStart()
}

startApp()
