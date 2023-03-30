import type AnswerEntity from '../entity/AnswerEntity'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'

export interface MailjetResponse {
  Messages: [
    {
      To: [
        {
          MessageHref: string
          MessageUUID: string
          MessageID: string
        },
      ]
    },
  ]
}

export interface FromMailObj {
  Email: string
  Name: string
}

export interface SendMailPayload {
  employee: EmployeeEntity
  answer: AnswerEntity
  template?: string
}
