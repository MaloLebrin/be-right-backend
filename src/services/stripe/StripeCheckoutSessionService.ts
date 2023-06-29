import { isProduction } from '../../utils/envHelper'
import type { ModePaymentEnum } from '../../types/Stripe/Payment'
import { StripeCurrency } from '../../types/Stripe/Payment'
import type { StripeProductForSession } from '../../types/Stripe/Products'
import { StripeService } from './StripeService'

export class StripeCheckoutSessionService extends StripeService {
  constructor() {
    super()
  }

  private buildSuccessUrl = () => {
    return `${isProduction()
      ? process.env.FRONT_URL
      : 'http://localhost:3000'}/commande/success?session_id={CHECKOUT_SESSION_ID}`
  }

  public getStripeCheckoutSession = async (stripeCheckoutSessionId: string) => {
    return this.stripe.checkout.sessions.retrieve(stripeCheckoutSessionId)
  }

  public getStripeCheckoutSessionByCustomerId = async (stripeCustomerId: string) => {
    return this.stripe.checkout.sessions.list({
      customer: stripeCustomerId,
    })
  }

  public createStripeCheckoutSession = async ({
    stripeCustomerId,
    customerEmail,
    modePayment,
    products,
  }: {
    stripeCustomerId: string
    customerEmail: string
    modePayment: ModePaymentEnum
    products: StripeProductForSession[]
  }) => {
    return this.stripe.checkout.sessions.create({
      currency: StripeCurrency.EUR,
      client_reference_id: stripeCustomerId,
      success_url: this.buildSuccessUrl(),
      customer: stripeCustomerId,
      customer_email: customerEmail,
      mode: modePayment,
      line_items: products,
    })
  }
}
