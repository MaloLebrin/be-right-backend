import { number, object, string } from 'yup'

export const updateUserSetting = object({
  body: object({
    paginatedRequestLimit: object({
      events: number().nullable().required(),
      recipients: number().nullable().required(),
      notifications: number().nullable().required(),
    }),
    theme: string().oneOf(['LIGHT', 'DARK']).notRequired().nullable(),
  }),
})
