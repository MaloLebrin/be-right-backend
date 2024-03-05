import { isProduction } from '../../utils/envHelper'
import { StripeService } from '../../services/stripe/stripe.service'
import { type ModePaymentEnum, StripeCurrency, type StripeProductForSession } from '../../types/Stripe'
import { useEnv } from '../../env'

export class StripeCheckoutSessionService extends StripeService {
  private CANCEL_URL: string = null
  private SUCCESS_URL: string = null

  constructor() {
    super()
    const { FRONT_URL } = useEnv()
    this.SUCCESS_URL = `${isProduction()
      ? FRONT_URL
      : 'http://localhost:3000'}/paiement/success-sessionId={CHECKOUT_SESSION_ID}`

    this.CANCEL_URL = `${isProduction()
      ? FRONT_URL
      : 'http://localhost:3000'}/paiement/cancel-sessionId={CHECKOUT_SESSION_ID}`
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
    modePayment,
    products,
  }: {
    stripeCustomerId: string
    modePayment: ModePaymentEnum
    products: StripeProductForSession[]
  }) => {
    return this.stripe.checkout.sessions.create({
      currency: StripeCurrency.EUR,
      client_reference_id: stripeCustomerId,
      success_url: this.SUCCESS_URL,
      cancel_url: this.CANCEL_URL,
      customer: stripeCustomerId,
      mode: modePayment,
      line_items: products,
    })
  }
}
