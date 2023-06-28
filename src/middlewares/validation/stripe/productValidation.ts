import {
  number,
  object,
  string,
} from 'yup'

export const productIdParamsValidation = object({
  body: object({
    productId: string().required('L\'identifiant du produit est requis'),
    quantity: number().required('La quantité de produits est requise'),
  }),
})
