import type { AddressEntity } from '../entity/AddressEntity'
import type { EmployeeEntity } from '../entity/employees/EmployeeEntity'

export type EmployeeCreationRequest = Omit<EmployeeEntity, 'address'>

export interface EmployeeCreateOneRequest {
  employee: EmployeeEntity
  address?: Partial<AddressEntity>
}

export interface UploadCSVEmployee {
  firstName: string
  lastName: string
  addressLine: string
  postalCode: string
  city: string
  country: string
  email: string
  phone: string
}
