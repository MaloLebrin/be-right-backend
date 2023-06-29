import type { NextFunction, Request, Response } from 'express'
import { StripeInvoiceService } from '../../services/stripe/StripeInvoiceService'
import { wrapperRequest } from '../../utils'
import { ApiError } from '../../middlewares/ApiError'
import type { StripeInvoiceStatusEnum } from '../../types/Stripe/Invoice'

export class StripeInvoiceController {
  private StripeInvoiceService: StripeInvoiceService

  constructor() {
    this.StripeInvoiceService = new StripeInvoiceService()
  }

  public getInvoiceForCustomer = async (req: Request, res: Response, next: NextFunction) => {
    await wrapperRequest(req, res, next, async () => {
      const stripeCustomerId = req.params.customerId

      if (!stripeCustomerId) {
        throw new ApiError(422, 'Identifiant du client manquant')
      }

      const Subscriptions = await this.StripeInvoiceService.getCustomerInvoices({
        stripeCustomerId,
        status: req.query.status as StripeInvoiceStatusEnum || undefined,
      })
      return res.status(200).json(Subscriptions.data)
    })
  }
}
