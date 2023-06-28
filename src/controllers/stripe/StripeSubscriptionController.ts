import type { NextFunction, Request, Response } from 'express'
import type { DataSource } from 'typeorm'
import { wrapperRequest } from '../../utils'
import { StripeSubscriptionService } from '../../services/stripe/StripeSubscriptionsService'

export class StripeSubscriptionController {
  private StripeSubscriptionService: StripeSubscriptionService
  constructor(DATA_SOURCE: DataSource) {
    if (DATA_SOURCE) {
      this.StripeSubscriptionService = new StripeSubscriptionService(DATA_SOURCE)
    }
  }

  public getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const Subscriptions = await this.StripeSubscriptionService.getAllStripeSubscriptions()
      return res.status(200).json(Subscriptions.data)
    })
  }
}
