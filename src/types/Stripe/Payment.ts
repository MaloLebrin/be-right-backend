import type { EventWithRelationsCreationPayload } from '../Event'

export enum ModePaymentEnum {
  PAYMENT = 'payment',
  SETUP = 'setup',
  SUBSCRIPTION = 'subscription',
}

export enum StripeCurrency {
  EUR = 'EUR',
}

export interface StripeCheckoutSessionCreationPayload extends EventWithRelationsCreationPayload {
  priceId: string
}
