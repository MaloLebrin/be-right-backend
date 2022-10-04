import type { NextFunction, Request, Response } from 'express'
import type { ObjectSchema } from 'yup'
import { array, boolean, date, number, object, string } from 'yup'
import type { ObjectShape } from 'yup/lib/object'
import { Role, ThemeEnumArray } from '../../types'
import { useLogger } from '../loggerService'

export function useValidation() {
  const validate = <T extends ObjectShape>(schema: ObjectSchema<T>) => async (req: Request, res: Response, next: NextFunction) => {
    const { logger } = useLogger()
    logger.info(`${req.url} validation started`)

    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      logger.info(`${req.url} validation ended with success`)
      return next()
    } catch (err) {
      logger.debug({ type: err.name, message: err.message })
      return res.status(500).json({ type: err.name, message: err.message })
    }
  }

  const emailAlreadyExistSchema = object({
    body: object({
      email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
    }),
  })

  const loginSchema = object({
    body: object({
      email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
      password: string().required('Le mot de passe est requis'),
    }),
  })

  const registerSchema = object({
    body: object({
      companyName: string().required('Nom de l\'entreprise est requis'),
      email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
      password: string().required('Le mot de passe est requis'),
      firstName: string().required('Le prénom est requis'),
      lastName: string().required('le nom est requis'),
      roles: string().oneOf([Role.PHOTOGRAPHER, Role.COMPANY]),
    }),
  })

  const themeSchema = object({
    body: object({
      theme: string().oneOf(ThemeEnumArray),
    }),
    params: object({
      id: number().required('L\'identifiant de l\'utilisateur est requis'),
    }),
  })

  const tokenSchema = object({
    body: object({
      token: string().min(128).required('Le token est requis'),
    }),
  })

  const createPhotographerSchema = object({
    body: object({
      email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
      firstName: string().required('Le prenom est requis'),
      lastName: string().required('Le nom est requis'),
      companyName: string().nullable(),
    }),
  })

  const idParamsSchema = object({
    params: object({
      id: number().required('L\'identifiant de l\'utilisateur est requis'),
    }),
  })

  const createAddressSchema = object({
    body: object({
      addressLine: string().required('L\'adresse est requise'),
      addressLine2: string().nullable(),
      postalCode: string().required('Le code postal est requis'),
      city: string().required('La ville est requise'),
      country: string().required('Le pays est requis'),
    }),
  })

  const createManyAnswersSchema = object({
    body: object({
      eventId: number().required('L\'adresse est requise'),
      employeeIds: array().of(number()).min(1, 'Sélectionnez au moins un destinataire')
        .required('Les destinataires sont obligatoire'),
    }),
  })

  const createOneAnswerSchema = object({
    body: object({
      eventId: number().required('L\'adresse est requise'),
      employeeId: number()
        .required('Les destinataires sont obligatoire'),
    }),
  })

  const updateAnswerStatusSchema = object({
    body: object({
      eventId: number().required('L\'adresse est requise'),
      employeeId: number()
        .required('Les destinataires sont obligatoire'),
    }),
    query: object({
      isSigned: boolean().required(),
    }),
  })

  const resetPasswordSchema = object({
    body: object({
      email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
      password: string().required('Le mot de passe est requis'),
      twoFactorRecoveryCode: string().required('Le twoFactorRecoveryCode est requis'),
    }),
  })

  const createbugSchema = object({
    body: object({
      name: string().required('Le nom est obligatoire'),
      url: string().url('L\'url est invalide'),
      description: string().required('La description est obligatoire'),
    }),
  })

  const createEmployeeSchema = object({
    body: object({
      // address: object({
      //   addressLine: string().required('L\'adresse est requise'),
      //   addressLine2: string().nullable(),
      //   postalCode: string().required('Le code postal est requis'),
      //   city: string().required('La ville est requise'),
      //   country: string().required('Le pays est requis'),
      // }).required('l\'addresse est requise'),
      employee: object({
        email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
        firstName: string().required('Le prénom est requis'),
        lastName: string().required('Le nom est requis'),
        phone: string().required('Le numéro de téléphone est requis'),
      }),
    }),
    params: object({
      id: number().required('L\'identifiant de l\'utilisateur est requis'),
    }),
  })

  const createManyEmployeesSchema = object({
    body: array().of(object({
      address: object({
        addressLine: string().required('L\'adresse est requise'),
        addressLine2: string().nullable(),
        postalCode: string().required('Le code postal est requis'),
        city: string().required('La ville est requise'),
        country: string().required('Le pays est requis'),
      }),
      employee: object({
        email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
        firstName: string().required('Le prénom est requis'),
        lastName: string().required('Le nom est requis'),
        phone: string().required('Le numéro de téléphone est requis'),
      }),
    })),
    params: object({
      id: number().required('L\'identifiant de l\'utilisateur est requis'),
    }),
  })

  const createManyEmployeesOnEventSchema = object({
    body: array().of(object({
      employee: object({
        email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
        firstName: string().required('Le prénom est requis'),
        lastName: string().required('Le nom est requis'),
        phone: string().required('Le numéro de téléphone est requis'),
      }),
    })),
    params: object({
      id: number().required('L\'identifiant de l\'utilisateur est requis'),
      eventId: number().required('L\'identifiant de l\'utilisateur est requis'),
    }),
  })

  const createOneEventSchema = object({
    body: object({
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
        // period: object().shape({
        // }).required('L\'événement doit avoir une date de début et une date de fin'),
        start: date().required('La date de début est obligatoire'),
        end: date().required('La date de fin est obligatoire'),
      }),
      photographerId: number().required('L\'identifiant du photographe est requis'),
    }),
    params: object({
      id: number().required('L\'identifiant de l\'utilisateur est requis'),
    }),
  })

  return {
    createAddressSchema,
    createbugSchema,
    createEmployeeSchema,
    createManyAnswersSchema,
    createManyEmployeesOnEventSchema,
    createManyEmployeesSchema,
    createOneAnswerSchema,
    createOneEventSchema,
    createPhotographerSchema,
    emailAlreadyExistSchema,
    idParamsSchema,
    loginSchema,
    registerSchema,
    resetPasswordSchema,
    themeSchema,
    tokenSchema,
    updateAnswerStatusSchema,
    validate,
  }
}
