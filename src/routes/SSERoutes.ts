import type { NextFunction, Request, Response } from 'express'
import type { DataSource } from 'typeorm'
import { type Channel, createSession } from 'better-sse'
import { verify } from 'jsonwebtoken'
import { useEnv } from '../env'
import { NotificationSSEService } from '../services/notifications/notificationSSEService'
import { wrapperRequest } from '../utils'
import type { BaseInterfaceRouter } from './BaseRouter'
import { BaseRouter } from './BaseRouter'

export class SSERoutes extends BaseRouter implements BaseInterfaceRouter {
  private notificationChannel: Channel<Record<string, unknown>, Record<string, unknown>>

  constructor(SOURCE: DataSource, {
    notificationChannel,
  }: {
    notificationChannel: Channel<Record<string, unknown>, Record<string, unknown>>
  }) {
    super(SOURCE)
    this.notificationChannel = notificationChannel
  }

  public intializeRoutes = () => {
    this.router.get('/:token', async (req: Request, res: Response, next: NextFunction) => {
      await wrapperRequest(req, res, next, async () => {
        const token = req.params.token

        const { JWT_SECRET } = useEnv()
        verify(token, JWT_SECRET)

        if (token) {
          const session = await createSession(req, res)
          this.notificationChannel.register(session)
          const notificationSSEService = new NotificationSSEService(this.DATA_SOURCE)

          setInterval(async () => {
            const notifications = await notificationSSEService.getAllUser({
              notificationToken: token,
            })

            if (notifications?.length > 0) {
              this.notificationChannel.broadcast(notifications, 'message')
            }
            // 5 secondes
          }, 5000)
        }
      })
    })

    return this.router
  }
}
