import type { StripeInvoiceStatusEnum } from '../../types/Stripe/Invoice'
import { StripeService } from './StripeService'

export class StripeInvoiceService extends StripeService {
  constructor() { super() }

  public getCustomerInvoices = async (
    {
      stripeCustomerId,
      status,
    }: {
      stripeCustomerId: string
      status?: StripeInvoiceStatusEnum
    }) => {
    return this.stripe.invoices.list({
      customer: stripeCustomerId,
      status,
    })
  }
}
