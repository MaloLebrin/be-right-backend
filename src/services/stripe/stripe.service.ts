import Stripe from 'stripe'
import { useEnv } from '../../env'
import { ApiError } from '../../middlewares/ApiError'

export abstract class StripeService {
  private privateKey: string | null = null
  private isConnected = false
  public stripe: Stripe | null = null

  constructor() {
    const { STRIPE_PRIVATE_KEY } = useEnv()
    if (!STRIPE_PRIVATE_KEY) {
      throw new ApiError(500, 'Stripe private key is not provided')
    }

    this.privateKey = STRIPE_PRIVATE_KEY
    if (!this.isConnected && this.privateKey) {
      this.stripe = new Stripe(this.privateKey, {
        apiVersion: '2024-04-10',
        typescript: true,
      })
      this.isConnected = true
    }
  }
}
