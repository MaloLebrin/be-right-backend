import { getManager } from 'typeorm'
import { AddressEntity, EmployeeEntity, UserEntity } from '../entity'
import type { AddressCreationServicePayload } from '../types'
import EventEntity from '../entity/EventEntity'

export class AddressService {
  public static async getOne(id: number) {
    return getManager().findOne(AddressEntity, id)
  }

  public static async getOneByUserId(userId: number) {
    return getManager().findOne(AddressEntity, {
      where: {
        user: userId,
      },
    })
  }

  public static async getOneByEmployeeId(employeeId: number) {
    return getManager().findOne(AddressEntity, {
      where: {
        employee: employeeId,
      },
    })
  }

  public static async getOneByEventId(eventId: number) {
    return getManager().findOne(AddressEntity, {
      where: {
        event: eventId,
      },
    })
  }

  public static async createOne(payload: AddressCreationServicePayload) {
    const { userId, eventId, employeeId, address } = payload

    const addressCreated = getManager().create(AddressEntity, address)

    await getManager().save(addressCreated)
    const addressToSend = await this.getOne(addressCreated.id)
    if (userId) {
      await getManager().update(UserEntity, userId, {
        address: addressToSend.id,
      })
      addressToSend.userId = userId
    } else if (eventId) {
      await getManager().update(EventEntity, eventId, {
        address: addressToSend.id,
      })
      addressToSend.eventId = eventId
    } else if (employeeId) {
      await getManager().update(EmployeeEntity, employeeId, {
        address: addressToSend.id,
      })
      addressToSend.employeeId = employeeId
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
    await getManager().update(AddressEntity, id, addressToStore)
    return this.getOne(id)
  }

  public static async deleteOne(id: number) {
    return getManager().delete(AddressEntity, id)
  }

  public static async softDelete(id: number) {
    return getManager().delete(AddressEntity, id)
  }
}
