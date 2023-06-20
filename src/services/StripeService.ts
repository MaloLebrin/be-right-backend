import Stripe from 'stripe'
import { useEnv } from '../env'

export abstract class StripeService {
  private privateKey: string | null = null
  private isConnected = false
  public stripe: Stripe | null = null

  constructor() {
    const { STRIPE_PRIVATE_KEY } = useEnv()
    this.privateKey = STRIPE_PRIVATE_KEY
    if (!this.isConnected && this.privateKey) {
      this.stripe = new Stripe(this.privateKey, {
        apiVersion: '2022-11-15',
        typescript: true,
      })
      this.isConnected = true
    }
  }
}
