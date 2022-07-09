import { Column, Entity, ManyToOne } from "typeorm"
import { UserEntity, BaseEntity, EmployeeEntity } from "."
import EventEntity from "./EventEntity"

@Entity()
export class AddressEntity extends BaseEntity {
  @Column()
  addressLine: string

  @Column({ nullable: true })
  addressLine2: string

  @Column()
  postalCode: number

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

  @ManyToOne(() => EventEntity, event => event.address, { nullable: true })
  event: EventEntity | number

  @ManyToOne(() => EmployeeEntity, employee => employee.address, { nullable: true })
  employee: EmployeeEntity | number
}