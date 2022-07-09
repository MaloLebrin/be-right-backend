import { AddressEntity } from "../entity"
import { getManager } from "typeorm"
import { AddressCreationServicePayload } from "../types"

export class UserService {

  public static async getOne(id: number) {
    return getManager().findOne(AddressEntity, id)
  }

  public static async getOneByUserId(userId: number) {
    return getManager().findOne(AddressEntity, {
      where: {
        user: userId
      }
    })
  }

  public static async getOneByEmployeeId(employeeId: number) {
    return getManager().findOne(AddressEntity, {
      where: {
        employee: employeeId,
      }
    })
  }

  public static async getOneByEventId(eventId: number) {
    return getManager().findOne(AddressEntity, {
      where: {
        event: eventId,
      }
    })
  }

  public static async createOne(payload: AddressCreationServicePayload) {
    const { userId, eventId, employeeId, address } = payload

    const newAddress = {
      ...address
    }
    if (userId) {
      newAddress.user = userId
    } else if (eventId) {
      newAddress.event = eventId
    } else if (employeeId) {
      newAddress.employee = employeeId
    }

    const addressCreated = getManager().create(AddressEntity, newAddress)
    await getManager().save(addressCreated)
    return this.getOne(addressCreated.id)
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
