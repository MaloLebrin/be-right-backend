import { PaymentError } from '../middlewares/ApiError'

export function toCent(amount: number) {
  if (amount === null || amount === undefined) {
    throw new PaymentError('amount cannot be Calculate toCent')
  }
  return amount * 100
}

export function fromCent(amount: number) {
  if (amount === null || amount === undefined) {
    throw new PaymentError('amount cannot be Calculate fromCent')
  }
  return amount / 100
}
