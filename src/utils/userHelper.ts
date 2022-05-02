import { UserEntity } from "../entity"

export function getfullUsername(user: UserEntity): string {
  return `${user.firstName} ${user.lastName}`
}
