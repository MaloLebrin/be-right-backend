import type { DataSource, EntityManager, Repository } from 'typeorm'
import axios from 'axios'
import type { AddressCreationServicePayload, GeoCodingResponse } from '../types'
import EventEntity from '../entity/EventEntity'
import { AddressEntity } from '../entity/AddressEntity'
import { EmployeeEntity } from '../entity/EmployeeEntity'
import { UserEntity } from '../entity/UserEntity'
import { isArray } from '../utils/'

export class AddressService {
  getManager: EntityManager

  repository: Repository<AddressEntity>

  constructor(APP_SOURCE: DataSource) {
    this.repository = APP_SOURCE.getRepository(AddressEntity)
    this.getManager = APP_SOURCE.manager
  }

  public getOne = async (id: number) => {
    return this.repository.findOne({
      where: { id },
    })
  }

  // public getOneByUserId(userId: number) {
  //   return this.repository.findOne({
  //     where: {
  //       user: userId,
  //     },
  //   })
  // }

  // public getOneByEmployeeId(employeeId: number) {
  //   return getManager().findOne(AddressEntity, {
  //     where: {
  //       employee: employeeId,
  //     },
  //   })
  // }

  // public getOneByEventId(eventId: number) {
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

  public createOne = async (payload: AddressCreationServicePayload) => {
    const { userId, eventId, employeeId, address } = payload

    const coordinates = await this.geoLocalisation(address)

    const addressCreated = this.repository.create({
      ...address,
      lat: coordinates?.lat || null,
      lng: coordinates?.lng || null,
    })

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

    const coordinates = await this.geoLocalisation(address)
    const addressToStore = {
      ...address,
      lat: coordinates?.lat || null,
      lng: coordinates?.lng || null,
      updatedAt: new Date(),
    }
    await this.repository.update(id, addressToStore)
    return this.getOne(id)
  }

  public deleteOne = async (id: number) => {
    return this.repository.delete(id)
  }

  public softDelete = async (id: number) => {
    return this.repository.softDelete(id)
  }

  private geoLocalisation = async (address: Partial<AddressEntity>) => {
    const { postalCode, city, addressLine } = address
    const street = addressLine.replace(' ', '+')
    const res = await axios<GeoCodingResponse>(`https://api-adresse.data.gouv.fr/search/?q=${street}&postcode=${postalCode}&city=${city}&type=housenumber&autocomplete=1`)

    const data = res.data as GeoCodingResponse

    if (data && data.features?.length > 0) {
      const coordinates = data.features[0].geometry.coordinates
      return {
        lat: coordinates[0],
        lng: coordinates[1],
      }
    }
    return null
  }
}
