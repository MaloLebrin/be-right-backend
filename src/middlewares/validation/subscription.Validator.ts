import { date, number, object, string } from 'yup'
import { SubscriptionEnumArray } from '../../types'

export const updateCompanySubscription = object({
  body: object({
    id: number().required('L\'identifiant de l\'abonnement est requis'),
    type: string().oneOf(SubscriptionEnumArray).required('Le type d\'abonnement est requis'),
    expireAt: date().required('La date d\'expiration est obligatoire'),
  }),
})
