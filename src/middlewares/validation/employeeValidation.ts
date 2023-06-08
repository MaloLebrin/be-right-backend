import { number, object, string } from 'yup'

export const adminCreateEmployeeSchema = object({
  body: object({
    address: object({
      addressLine: string().required('L\'adresse est requise'),
      addressLine2: string().nullable(),
      postalCode: string().required('Le code postal est requis'),
      city: string().required('La ville est requise'),
      country: string().required('Le pays est requis'),
    }).required('l\'addresse est requise'),
    employee: object({
      email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
      firstName: string().required('Le prénom est requis'),
      lastName: string().required('Le nom est requis'),
      phone: string().required('Le numéro de téléphone est requis'),
    }),
    userId: number().required('L\'identifiant de l\'utilisateur est requis'),
  }),
})
