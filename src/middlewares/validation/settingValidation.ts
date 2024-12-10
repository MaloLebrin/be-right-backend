import { number, object, string } from 'yup'

export const updateUserSetting = object({
  body: object({
    paginatedRequestLimit: object({
      events: number().nullable(),
      recipients: number().nullable(),
      notifications: number().nullable(),
    }),
    theme: string().oneOf(['LIGHT', 'DARK']).notRequired().nullable(),
  }),
})
