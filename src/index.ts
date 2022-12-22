import 'reflect-metadata'
import type { NextFunction, Request, Response } from 'express'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import cloudinary from 'cloudinary'
import Context from './context'
import { addressRoutes, answerRoutes, authRoutes, bugreportRoutes, employeeRoutes, eventRoutes, fileRoutes, newsletterRoutes, userRoutes } from './routes'
import { useLogger } from './middlewares/loggerService'
import { useEnv } from './env'
import { createAppSource } from './utils'

export const APP_SOURCE = createAppSource()

// async function startServer() {
const {
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
  CLOUDINARY_CLOUD_NAME,
  NODE_ENV,
  PORT,
} = useEnv()

APP_SOURCE.initialize().then(async () => {
  const app = express()
  const { loggerMiddleware } = useLogger()
  dotenv.config()
  app.use(cors())
  app.use(helmet())
  app.use(express.json())
  app.use(express.urlencoded({
    extended: true,
  }))
  app.use(loggerMiddleware)

  cloudinary.v2.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
  })

  app.use((req: Request, res: Response, next: NextFunction) => {
    Context.bind(req)
    next()
  })

  app.get('/', (req: Request, res: Response) => {
    res.send('Hello World')
  })

  app.use('/address', addressRoutes)
  app.use('/answer', answerRoutes)
  app.use('/auth', authRoutes)
  app.use('/bugreport', bugreportRoutes)
  app.use('/employee', employeeRoutes)
  app.use('/event', eventRoutes)
  app.use('/file', fileRoutes)
  app.use('/newsletter', newsletterRoutes)
  app.use('/user', userRoutes)

  const port = PORT || 5000
  app.listen(port, '0.0.0.0', () => {
    console.info(`Application is running in ${NODE_ENV} mode on port : ${port}`)
  })
}).catch(error => console.info(error))
// }
// startServer()
