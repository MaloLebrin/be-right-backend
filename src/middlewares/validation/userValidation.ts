import {
  number,
  object,
  string,
} from 'yup'

export const addSignatureToUser = object({
  body: object({
    signature: string().required('La signature est requise'),
  }),
  params: object({
    id: number().required('L\'identifiant de la réponse est requis'),
  }),
})
