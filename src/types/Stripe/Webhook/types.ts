type WebhookEventTypePayment =
  'payment_intent.succeeded' |
  'payment_method.attached'

type WebhookEventTypeCheckoutSession =
  'checkout.session.async_payment_failed' |
  'checkout.session.async_payment_succeeded' |
  'checkout.session.completed' |
  'checkout.session.expired'

export type WebHookEventType =
  WebhookEventTypePayment |
  WebhookEventTypeCheckoutSession
