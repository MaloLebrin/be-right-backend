import { number, object, string } from 'yup'
import { SubscriptionEnumArray } from '../../types'

export const updateCompanySubscription = object({
  body: object({
    id: number().required('L\'identifiant de l\'abonnement est requis'),
    companyId: number().required('L\'identifiant de l\'entreprise est requis'),
    type: string().oneOf(SubscriptionEnumArray).required('Le type d\'abonnement est requis'),
  }),
})
