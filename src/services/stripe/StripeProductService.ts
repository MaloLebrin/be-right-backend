import type Stripe from 'stripe'
import { StripeService } from '../../services/stripe/StripeService'
import { fromCent } from '../../utils/paymentHelper'

export class StripeProductService extends StripeService {
  constructor() { super() }

  public getProducts = async () => {
    return this.stripe.products.list({ expand: ['data.default_price'] })
  }

  public getAmountForProduct = async ({ productId, quantity = 1 }: { productId: string; quantity?: number }) => {
    const product = await this.stripe.products.retrieve(productId, { expand: ['default_price'] })
    const price = product.default_price as Stripe.Price

    return {
      id: productId,
      unitAmout: fromCent(price.unit_amount),
      totalAmount: fromCent(price.unit_amount * quantity),
      quantity,
    }
  }
}
