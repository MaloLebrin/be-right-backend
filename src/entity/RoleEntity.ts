/* eslint-disable @typescript-eslint/indent */

import { Column, Entity, ManyToMany } from 'typeorm'
import { Role } from '../types'
import { BaseEntity, UserEntity } from '.'

@Entity()
export class RoleEntity extends BaseEntity {
  @Column({ type: 'enum', enum: Role, default: Role.USER })
  name: Role

  @ManyToMany(() => UserEntity)
  users: UserEntity[]

  @Column({ nullable: true })
  description: string

  @Column({ nullable: true })
  permissions: string[]
}
