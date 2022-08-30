import type { AddressEntity, EmployeeEntity } from '../entity'

export type EmployeeCreationRequest = Omit<EmployeeEntity, 'address'>

export interface EmployeeCreateOneRequest {
  employee: EmployeeEntity
  address?: Partial<AddressEntity>
}

