import type { AddressEntity } from '../entity/AddressEntity'

export interface AddressCreationServicePayload {
  address: Partial<AddressEntity>
  userId?: number | null
  employeeId?: number | null
  eventId?: number | null
}
