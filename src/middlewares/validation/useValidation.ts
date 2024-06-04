import type { NextFunction, Request, Response } from 'express'
import type { ObjectSchema, ObjectShape } from 'yup'
import { array, date, number, object, string } from 'yup'
import { NotificationTypeEnumArray, Role } from '../../types'
import { logger } from '../loggerService'

export function useValidation() {
  const validate = <T extends ObjectShape>(schema: ObjectSchema<T>) => async (req: Request, res: Response, next: NextFunction) => {
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
      logger.debug({ type: err.name, message: err.message, request: req.url })
      return res.status(422).json({ type: err.name, message: err.message, request: req.url })
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
    }),
  })

  const newUserSchema = object({
    body: object({
      email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
      firstName: string().required('Le prénom est requis'),
      lastName: string().required('le nom est requis'),
      roles: string().oneOf([Role.OWNER, Role.USER], 'Vous devre renseigner un rôle').required('Le rôle est requis'),
    }),
  })

  const patchUserSchema = object({
    body: object({
      user: object({
        email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
        firstName: string().required('Le prénom est requis'),
        lastName: string().required('le nom est requis'),
        roles: string().oneOf([Role.OWNER, Role.USER], 'Vous devre renseigner un rôle').required('Le rôle est requis'),
      }).required('L\'utilisateur est requis'),
    }),
    params: object({
      id: number().required('L\'identifiant de l\'utilisateur est requis'),
    }),
  })

  const patchAddressSchema = object({
    body: object({
      address: object({
        addressLine: string().required('L\'adresse est requise'),
        addressLine2: string().nullable(),
        postalCode: string().required('Le code postal est requis'),
        city: string().required('La ville est requise'),
        country: string().required('Le pays est requis'),
      }).required('L\'adresse est requis'),
    }),
    params: object({
      id: number().required('L\'identifiant de l\'adresse est requis'),
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
      address: object({
        addressLine: string().required('L\'adresse est requise'),
        addressLine2: string().nullable(),
        postalCode: string().required('Le code postal est requis'),
        city: string().required('La ville est requise'),
        country: string().required('Le pays est requis'),
      }).required('l\'addresse est requise'),
    }),
  })

  const resetPasswordSchema = object({
    body: object({
      email: string().email('vous devez entrer in email valide').required('L\'adresse email est requise'),
      password: string().required('Le mot de passe est requis'),
      twoFactorRecoveryCode: string().required('Le twoFactorRecoveryCode est requis'),
    }),
  })

  const createEmployeeSchema = object({
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
      eventId: number().required('L\'identifiant de l\'événement est requis'),
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
        start: date().required('La date de début est obligatoire'),
        end: date().required('La date de fin est obligatoire'),
        employeeIds: array().of(number()).min(1, 'Sélectionnez au moins un destinataire')
          .required('Les destinataires sont obligatoire'),
      }),
      photographerId: number().required('L\'identifiant du photographe est requis'),
    }),
  })

  const subscribeNotification = object({
    body: object({
      type: string().oneOf(NotificationTypeEnumArray).required('Le type d\'abonnement est requis'),
    }),
  })

  const createGroupSchema = object({
    body: object({
      group: object({
        name: string().required('Le nom du groupe est requis'),
        description: string().nullable(),
        employeeIds: array().of(number()).required(),
      }),
    }),
  })

  const createGroupCSVSchema = object({
    body: object({
      group: object({
        name: string().required('Le nom du groupe est requis'),
        description: string().nullable(),
      }),
    }),
  })

  return {
    createAddressSchema,
    createEmployeeSchema,
    createGroupSchema,
    createGroupCSVSchema,
    createManyEmployeesOnEventSchema,
    createManyEmployeesSchema,
    createOneEventSchema,
    createPhotographerSchema,
    emailAlreadyExistSchema,
    idParamsSchema,
    loginSchema,
    newUserSchema,
    patchAddressSchema,
    patchUserSchema,
    registerSchema,
    resetPasswordSchema,
    subscribeNotification,
    tokenSchema,
    validate,
  }
}
