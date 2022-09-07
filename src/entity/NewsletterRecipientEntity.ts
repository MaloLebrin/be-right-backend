/* eslint-disable @typescript-eslint/indent */

import { Column, Entity } from 'typeorm'
import { BaseEntity } from './BaseEntity'

@Entity()
export class NewsletterRecipient extends BaseEntity {
  @Column({ unique: true })
  email: string

  @Column({ length: 100, nullable: true })
  firstName: string

  @Column({ length: 100, nullable: true })
  lastName: string

  @Column({ nullable: true })
  companyName: string
}

export const newsletterRecipientSearchableFields = [
  'email',
  'firstName',
  'lastName',
  'companyName',
]
