import { AddressEntity, EmployeeEntity, UserEntity } from '../entity'
import type { AddressCreationServicePayload } from '../types'
import EventEntity from '../entity/EventEntity'
import { APP_SOURCE } from '..'

export class AddressService {
  static getManager = APP_SOURCE.manager

  static repository = APP_SOURCE.getRepository(AddressEntity)

  public static async getOne(id: number) {
    return this.repository.findOne({
      where: { id },
    })
  }

  // public static async getOneByUserId(userId: number) {
  //   return this.repository.findOne({
  //     where: {
  //       user: userId,
  //     },
  //   })
  // }

  // public static async getOneByEmployeeId(employeeId: number) {
  //   return getManager().findOne(AddressEntity, {
  //     where: {
  //       employee: employeeId,
  //     },
  //   })
  // }

  // public static async getOneByEventId(eventId: number) {
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

  public static async createOne(payload: AddressCreationServicePayload) {
    const { userId, eventId, employeeId, address } = payload

    const addressCreated = this.repository.create(address)

    await this.repository.save(addressCreated)
    const addressToSend = await this.getOne(addressCreated.id)
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

  public static async updateOne(id: number, address: Partial<AddressEntity>) {
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

  public static async deleteOne(id: number) {
    return this.repository.delete(id)
  }

  public static async softDelete(id: number) {
    return this.repository.delete(id)
  }
}
