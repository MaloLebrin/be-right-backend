import "reflect-metadata"
import { createConnection, getConnectionOptions } from "typeorm"
import { createExpressServer } from 'routing-controllers'
import express, { NextFunction, Request, Response } from 'express'
import cors from "cors"
import helmet from "helmet"
import * as dotenv from "dotenv"
import Context from "./context"
import cloudinary from "cloudinary"
import { PostgresConnectionOptions } from "typeorm/driver/postgres/PostgresConnectionOptions"
import answerRoute from './routes/answerRoutes'
import authRoutes from './routes/authRoutes'
import bugReportRoutes from './routes/bugReportRoutes'
import employeeRoutes from './routes/employeeRoutes'
import eventRoutes from './routes/eventRoutes'
import fileRoutes from './routes/fileRoutes'
import newsletterRoutes from './routes/newsletterRoutes'
import userRoutes from './routes/userRoutes'

async function startServer() {
  const config = await getConnectionOptions(process.env.NODE_ENV) as PostgresConnectionOptions
  let connectionsOptions = config

  if (process.env.NODE_ENV === 'production') {
    connectionsOptions = {
      ...config,
      url: process.env.DATABASE_URL!,
    }
  } else {
    connectionsOptions = {
      ...config,
      name: 'default',
    }
  }

  createConnection({ ...connectionsOptions, name: 'default' }).then(async connection => {
    const app = createExpressServer()
    dotenv.config()
    app.use(cors())
    app.use(helmet())
    app.use(express.json())
    app.use(express.urlencoded({
      extended: true
    }))

    cloudinary.v2.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    })

    app.use((req: Request, res: Response, next: NextFunction) => {
      Context.bind(req)
      next()
    })

    app.get('/', (req: Request, res: Response) => {
      res.send('Hello World')
    })

    app.use('/user', userRoutes)
    app.use('/event', eventRoutes)
    app.use('/employee', employeeRoutes)
    app.use('/newsletter', newsletterRoutes)
    app.use('/file', fileRoutes)
    app.use('/answer', answerRoute)
    app.use('/bugreport', bugReportRoutes)
    app.use('/auth', authRoutes)

    const port = process.env.PORT || 5000
    app.listen(port, '0.0.0.0', () => {
      console.log('Application is running in ' + process.env.NODE_ENV + ' mode on port : ' + port)
    })

  }).catch(error => console.log(error))
}
startServer()
