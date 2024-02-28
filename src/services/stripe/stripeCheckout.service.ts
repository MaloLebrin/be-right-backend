import { isProduction } from '../../utils/envHelper'
import { StripeService } from '../../services/stripe/stripe.service'
import { type ModePaymentEnum, StripeCurrency, type StripeProductForSession } from '../../types/Stripe'
import { useEnv } from '../../env'

export class StripeCheckoutSessionService extends StripeService {
  constructor() {
    super()
  }

  private buildSuccessUrl = () => {
    const { FRONT_URL } = useEnv()
    return `${isProduction()
      ? FRONT_URL
      : 'http://localhost:3000'}/paiement/success?session_id={CHECKOUT_SESSION_ID}`
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
      success_url: this.buildSuccessUrl(),
      customer: stripeCustomerId,
      mode: modePayment,
      line_items: products,
    })
  }
}
