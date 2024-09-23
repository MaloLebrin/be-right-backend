import {
  array,
  date,
  number,
  object,
  string,
} from 'yup'

export const payEventValidation = object({
  body: object({
    priceId: string().required('L\'identifiant du prix est requis'),
    address: object({
      addressLine: string().required('L\'adresse est requise'),
      addressLine2: string().nullable(),
      postalCode: string().required('Le code postal est requis'),
      city: string().required('La ville est requise'),
      country: string().required('Le pays est requis'),
    }),
    event: object({
      name: string().required('le nom de l\'événement est obligatoire'),
      description: string().nullable(),
      start: date().required('La date de début est obligatoire'),
      end: date().required('La date de fin est obligatoire'),
      employeeIds: array().of(number()).min(1, 'Sélectionnez au moins un destinataire')
        .required('Les destinataires sont obligatoire'),
    }),
    photographerId: number().required('L\'identifiant du photographe est requis'),
  }),
})

export const successfullPayment = object({
  params: object({
    sessionId: string().required('L\'identifiant de la session de paiement est requis'),
  }),
})
