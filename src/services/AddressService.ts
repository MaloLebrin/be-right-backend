import type { DataSource, EntityManager, Repository } from 'typeorm'
import axios from 'axios'
import type { AddressCreationServicePayload, GeoCodingResponse } from '../types'
import EventEntity from '../entity/EventEntity'
import { AddressEntity } from '../entity/AddressEntity'
import { EmployeeEntity } from '../entity/EmployeeEntity'
import { UserEntity } from '../entity/UserEntity'
import { isArray } from '../utils/'
import { useEnv } from '../env'

export class AddressService {
  getManager: EntityManager

  repository: Repository<AddressEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(AddressEntity)
    this.getManager = APP_SOURCE.manager
  }

  async getOne(id: number) {
    return this.repository.findOne({
      where: { id },
    })
  }

  // async getOneByUserId(userId: number) {
  //   return this.repository.findOne({
  //     where: {
  //       user: userId,
  //     },
  //   })
  // }

  // async getOneByEmployeeId(employeeId: number) {
  //   return getManager().findOne(AddressEntity, {
  //     where: {
  //       employee: employeeId,
  //     },
  //   })
  // }

  // async getOneByEventId(eventId: number) {
  //   const event = await getManager().findOne(EventEntity, eventId)
  //   console.warn(event, '<==== event')
  //   // const addressId = event.addressId
  //   return getManager().findOne(AddressEntity, {
  //     where: {
  //       event: eventId,
  //     },
  //     relations: ['addressId'],
  //   })
  // }

  async createOne(payload: AddressCreationServicePayload) {
    const { userId, eventId, employeeId, address } = payload

    const addressCreated = this.repository.create(address)

    await this.repository.save(addressCreated)
    const addressToSend = isArray(addressCreated) ? addressCreated[0] : addressCreated as unknown as AddressEntity
    if (userId) {
      await this.getManager.update(UserEntity, userId, {
        address: addressToSend.id,
      })
    } else if (eventId) {
      await this.getManager.update(EventEntity, eventId, {
        address: addressToSend.id,
      })
    } else if (employeeId) {
      await this.getManager.update(EmployeeEntity, employeeId, {
        address: addressToSend.id,
      })
    }
    return addressToSend
  }

  public updateOne = async (id: number, address: Partial<AddressEntity>) => {
    const addressToUpdate = await this.getOne(id)
    if (!addressToUpdate) {
      return null
    }
    const addressToStore = {
      ...address,
      updatedAt: new Date(),
    }
    await this.repository.update(id, addressToStore)
    return this.getOne(id)
  }

  public deleteOne = (id: number) => {
    return this.repository.delete(id)
  }

  public softDelete = (id: number) => {
    return this.repository.softDelete(id)
  }

  private geoLocalisation = async (address: Partial<AddressEntity>) => {
    const { GEO_CODING_API_URL } = useEnv()
    const { postalCode, city, addressLine } = address

    if (GEO_CODING_API_URL) {
      const street = addressLine.replace(' ', '+')

      const res = await axios<GeoCodingResponse>(`${GEO_CODING_API_URL}?q=${street}&postcode=${postalCode}&city=${city}&type=housenumber&autocomplete=1`)

      const data = res.data as GeoCodingResponse

      if (data && data.features?.length > 0) {
        const coordinates = data.features[0].geometry.coordinates
        return {
          lat: coordinates[0],
          lng: coordinates[1],
        }
      }
    }
    return null
  }
}
