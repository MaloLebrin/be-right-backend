import { EmployeeEntity } from "../entity/EmployeeEntity"
import EventEntity from "../entity/EventEntity"
import { getManager } from "typeorm"
import { ThemeEnum, UserEntity } from "../entity/UserEntity"
import { FileEntity } from "../entity/FileEntity"

export default class UserService {

  public static async getByToken(token: string): Promise<UserEntity> {
    const userFinded = await getManager().findOne(UserEntity, { token }, { relations: ["events", "files", "employee"] })
    if (userFinded) {
      const events = userFinded.events as EventEntity[]
      const employees = userFinded.employee as EmployeeEntity[]
      const files = userFinded.files as FileEntity[]
      // FIXME if arrrays are empty, send array empty
      return {
        ...userFinded,
        events: events.map(event => ({
          ...event,
          createdByUser: userFinded.id,
        })),
        employee: employees.map(employee => ({
          ...employee,
          createdByUser: userFinded.id,
        })),
        files: files.map(file => ({
          ...file,
          createdByUser: userFinded.id,
        })),
      }
    }
  }
  public static async updateTheme(id: number, theme: ThemeEnum) {
    const user = await getManager().findOne(UserEntity, id)
    user.theme = theme
    await getManager().save(user)
    return user
  }

  public static async getOneWithRelations(id: number): Promise<UserEntity> {
    const user = await getManager().findOne(UserEntity, id, { relations: ["events", "files", "employee"] })
    const events = user.events as EventEntity[]
    const employees = user.employee as EmployeeEntity[]
    const files = user.files as FileEntity[]
    return {
      ...user,
      events: events.map(event => event.id).filter(id => id),
      employee: employees.map(employee => employee.id).filter(id => id),
      files: files.map(file => file.id).filter(id => id),
    }
  }
}