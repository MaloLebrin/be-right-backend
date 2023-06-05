import {
  array,
  boolean,
  number,
  object,
  string,
} from 'yup'

export const signeAnswerValidation = object({
  body: object({
    token: string().min(128).required('Le token est requis'),
    email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
    hasSigned: boolean().required('Vous devez accpeter ou refuser le droit à l\'image'),
    signature: string().required('La signature est requise'),
    isSavedSignatureForNextTime: boolean(),
  }),
  params: object({
    id: number().required('L\'identifiant de la réponse est requis'),
  }),
})

export const createManyAnswersSchema = object({
  body: object({
    eventId: number().required('L\'adresse est requise'),
    employeeIds: array().of(number()).min(1, 'Sélectionnez au moins un destinataire')
      .required('Les destinataires sont obligatoire'),
  }),
})

export const AdminCreateManyAnswersSchema = object({
  body: object({
    eventId: number().required('L\'adresse est requise'),
    userId: number().required('L\'utilisateur est requis'),
    employeeIds: array().of(number()).min(1, 'Sélectionnez au moins un destinataire')
      .required('Les destinataires sont obligatoire'),
  }),
})

export const createOneAnswerSchema = object({
  body: object({
    eventId: number().required('L\'adresse est requise'),
    employeeId: number()
      .required('Les destinataires sont obligatoire'),
  }),
})

export const getAnswerForEmployee = object({
  body: object({
    email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
    token: string().min(128).required('Le token est requis'),
  }),
})

export const doubleAuthSchema = object({
  body: object({
    email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
    token: string().min(128).required('Le token est requis'),
    twoFactorCode: string()
      .matches(/^[a-zA-Z0-9]+$/)
      .min(5, 'Veuillez remplir les 5 cases')
      .max(5, 'Vous devez remplir 5 cases')
      .required('Le code vérification est obligatoire'),
  }),
})
