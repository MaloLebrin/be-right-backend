import type { NextFunction, Request, Response } from 'express'
import type { ObjectSchema } from 'yup'
import type { ObjectShape } from 'yup/lib/object'
import { object, string } from 'yup'
import { Role, ThemeEnumArray } from '../../types'

export function useValidation() {
  const validate = <T extends ObjectShape>(schema: ObjectSchema<T>) => async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.validate({
        body: req.body,
        query: req.query,
        params: req.params,
      })
      return next()
    } catch (err) {
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
  })

  const tokenSchema = object({
    body: object({
      token: string().min(128).required('Le token est requis'),
    }),
  })

  return {
    validate,
    emailAlreadyExistSchema,
    loginSchema,
    registerSchema,
    themeSchema,
    tokenSchema,
  }
}
