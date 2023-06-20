import type AnswerEntity from '../entity/AnswerEntity'
import type EventEntity from '../entity/EventEntity'
import type { UserEntity } from '../entity/UserEntity'
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
  event: EventEntity
  creator: UserEntity
  template?: string
}
