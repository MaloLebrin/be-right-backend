export interface CheckoutSession {
  id: string
  object: string
  after_expiration: null
  allow_promotion_codes: null
  amount_subtotal: number
  amount_total: number
  automatic_tax: AutomaticTax
  billing_address_collection: null
  cancel_url: null
  client_reference_id: null
  consent: null
  consent_collection: null
  created: number
  currency: string
  custom_fields: unknown[]
  custom_text: CustomText
  customer: null
  customer_creation: string
  customer_details: null
  customer_email: null
  expires_at: number
  invoice: null
  invoice_creation: InvoiceCreation
  livemode: boolean
  locale: null
  metadata: Metadata2
  mode: string
  payment_intent: null
  payment_link: null
  payment_method_collection: string
  payment_method_options: PaymentMethodOptions
  payment_method_types: string[]
  payment_status: string
  phone_number_collection: PhoneNumberCollection
  recovered_from: null
  setup_intent: null
  shipping_address_collection: null
  shipping_cost: null
  shipping_details: null
  shipping_options: unknown[]
  status: string
  submit_type: null
  subscription: null
  success_url: string
  total_details: TotalDetails
  url: string
}

export interface AutomaticTax {
  enabled: boolean
  liability: null
  status: null
}

export interface CustomText {
  shipping_address: null
  submit: null
}

export interface InvoiceCreation {
  enabled: boolean
  invoice_data: InvoiceData
}

export interface InvoiceData {
  account_tax_ids: null
  custom_fields: null
  description: null
  footer: null
  issuer: null
  metadata: Metadata
  rendering_options: null
}

export interface Metadata {}

export interface Metadata2 {}

export interface PaymentMethodOptions {}

export interface PhoneNumberCollection {
  enabled: boolean
}

export interface TotalDetails {
  amount_discount: number
  amount_shipping: number
  amount_tax: number
}
