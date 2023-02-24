import { Column, Entity } from 'typeorm'
import { BaseEntity } from './bases/BaseEntity'

@Entity()
export class AddressEntity extends BaseEntity {
  @Column()
  addressLine: string

  @Column({ nullable: true })
  addressLine2: string | null

  @Column()
  postalCode: string

  @Column()
  city: string

  @Column({ nullable: true })
  subdivision: string | null // Code ISO des régions (pour la France)

  @Column({ nullable: true })
  subdivision2: string | null // Code ISO des départements (pour la France)

  @Column({ default: 'France' })
  country: string

  @Column({ nullable: true, type: 'float8' })
  lat: number | null

  @Column({ nullable: true, type: 'float8' })
  lng: number | null
}
