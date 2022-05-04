import { UserEntity } from "../entity"
import { hasOwnProperty } from "./objectHelper"

export function getfullUsername(user: UserEntity): string {
  return `${user.firstName} ${user.lastName}`
}

export function isUserEntity(user: any): user is UserEntity {
  return hasOwnProperty(user, 'token') && hasOwnProperty(user, 'salt')
}
