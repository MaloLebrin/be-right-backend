import type { WebHookEventType } from './types'

export interface WebhookEvent<T> {
  id: string
  object: 'event'
  api_version: string
  created: number
  data: WebhookEventData<T>
  livemode: boolean
  pending_webhooks: number
  request: WebhookRequest
  type: WebHookEventType
}

interface WebhookEventData<T> {
  object: T
}

export interface StripeWebhookEventObject {
  id: string
  object: string
  application?: null
  automatic_payment_methods?: null
  cancellation_reason?: null
  client_secret: string
  created: number
  customer?: null
  description?: null
  flow_directions?: null
  last_setup_error?: null
  latest_attempt?: null
  livemode: boolean
  mandate?: null
  metadata: Metadata
  next_action?: null
  on_behalf_of?: null
  payment_method: string
  payment_method_options: PaymentMethodOptions
  payment_method_types?: (string)[] | null
  single_use_mandate?: null
  status: string
  usage: string
}

interface Metadata {}

interface PaymentMethodOptions {
  acss_debit: AcssDebit
}

interface AcssDebit {
  currency: string
  mandate_options: MandateOptions
  verification_method: string
}

interface MandateOptions {
  interval_description: string
  payment_schedule: string
  transaction_type: string
}

interface WebhookRequest {
  id?: null
  idempotency_key?: null
}
