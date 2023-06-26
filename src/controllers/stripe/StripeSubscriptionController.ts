import type { NextFunction, Request, Response } from 'express'
import { wrapperRequest } from '../../utils'
import { StripeSubscriptionService } from '../../services/stripe/StripeSubscriptionsService'

export class StripeSubscriptionController {
  private StripeSubscriptionService: StripeSubscriptionService
  constructor() {
    this.StripeSubscriptionService = new StripeSubscriptionService()
  }

  public getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const Subscriptions = await this.StripeSubscriptionService.getAllStripeSubscriptions()
      return res.status(200).json(Subscriptions.data)
    })
  }
}
