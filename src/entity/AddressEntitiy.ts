import { Column, Entity, ManyToOne } from "typeorm"
import { UserEntity, EmployeeEntity } from "."
import EventEntity from "./EventEntity"
import { BaseEntity } from "./BaseEntity"

@Entity()
export class AddressEntity extends BaseEntity {
  @Column()
  addressLine: string

  @Column({ nullable: true })
  addressLine2: string

  @Column()
  postalCode: string

  @Column()
  city: string

  @Column({ nullable: true })
  subdivision: string // Code ISO des régions (pour la France)

  @Column({ nullable: true })
  subdivision2: string // Code ISO des départements (pour la France)

  @Column({ default: 'France' })
  country: string

  @Column({ nullable: true })
  lat: number

  @Column({ nullable: true })
  lng: number

  @ManyToOne(() => UserEntity, user => user.address, { nullable: true })
  user: UserEntity | number

  @ManyToOne(() => EventEntity, event => event.address, { nullable: true, onDelete: 'CASCADE' })
  event: EventEntity | number

  @ManyToOne(() => EmployeeEntity, employee => employee.address, { nullable: true })
  employee: EmployeeEntity | number
}
