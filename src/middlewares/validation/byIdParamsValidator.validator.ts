import { number, object } from 'yup'

export const idParamsSchema = object({
  params: object({
    id: number().required('L\'identifiant est requis'),
  }),
})
