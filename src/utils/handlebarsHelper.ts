import { create } from 'express-handlebars'
import { toFormat } from './dateHelper'

export const hbs = create({
  helpers: {
    toFormat(date: string | Date) {
      return toFormat(date, 'DD/MM/YYYY')
    },
  },
})
