import type { AddressEntity } from '../entity/AddressEntity'

export interface AddressCreationServicePayload {
  address: Partial<AddressEntity>
  companyId?: number | null
  employeeId?: number | null
  eventId?: number | null
}

export interface GeoCodingFeature {
  geometry: {
    coordinates: [number, number]
  }
  properties: {
    label: string
    houseNumber: string
    id: number
    name: string
    postcode: string
    citycode: string
    city: string
    context: string
    street: string
  }
}

export interface GeoCodingResponse {
  features: GeoCodingFeature[]
}
