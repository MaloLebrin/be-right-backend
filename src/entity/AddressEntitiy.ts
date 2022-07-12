import { Column, Entity, JoinColumn, OneToOne } from "typeorm"
import { UserEntity } from "."
import { BaseEntity } from "./BaseEntity"
import { EmployeeEntity } from "./EmployeeEntity"
import EventEntity from "./EventEntity"

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

  @OneToOne(() => EmployeeEntity, { cascade: true })
  @JoinColumn()
  employeeId: EmployeeEntity | number
  @OneToOne(() => UserEntity, { cascade: true })
  @JoinColumn()
  userId: UserEntity | number
  @OneToOne(() => EventEntity, { cascade: true })
  @JoinColumn()
  eventId: EventEntity | number
}
