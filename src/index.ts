import "reflect-metadata"
import { createConnection } from "typeorm"
import { createExpressServer } from 'routing-controllers'
import express, { NextFunction, Request, Response } from 'express'
import config from './typeOrmConfig'
import cors from "cors"
import helmet from "helmet"
import dotenv from "dotenv"
import Context from "./context"
import userRoutes from './routes/userRoutes'
import eventRoutes from './routes/eventRoutes'
import employeeRoutes from './routes/employeeRoutes'
import imageRightConditionRoutes from './routes/imageRightConditionRoutes'
import newsletterRoutes from './routes/newsletterRoutes'

createConnection().then(async connection => {
    const app = createExpressServer(config)
    dotenv.config()
    app.use(cors())
    app.use(helmet())
    app.use(express.json())
    app.use(express.urlencoded({
        extended: true
    }))

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
    app.use('/imageRight', imageRightConditionRoutes)
    app.use('/newsletter', newsletterRoutes)

    const server = app.listen(process.env.PORT, '0.0.0.0', () => {
        console.log('Application is running at: ' + server.address().address + ':' + server.address().port)
    })

}).catch(error => console.log(error))
