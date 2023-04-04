import { expect, test } from 'vitest'
import usersJSON from '../fixtures/premium/users.json'
import type { UserEntity } from '../../entity/UserEntity'
import {
  getfullUsername,
  isUserEntity,
  isUserOwner,
} from '../../utils/userHelper'

const users = usersJSON as unknown as UserEntity[]

test('getfullUsername send right fullName', () => {
  expect(getfullUsername(users[0])).toEqual('Phineas Nigellus Black')
  expect(getfullUsername(users[1])).toEqual('Albus Dumbledore')
})

test('isUserEntity send right fullName', () => {
  expect(isUserEntity(users[0])).toBeTruthy()
  expect(isUserEntity(users[1])).toBeTruthy()
  expect(isUserEntity({ a: 'test' })).toBeFalsy()
  expect(isUserEntity({ firstName: 'test' })).toBeFalsy()
})

test('isUserOwner send right fullName', () => {
  expect(isUserOwner(users[0])).toBeFalsy()
  expect(isUserOwner(users[1])).toBeTruthy()
})
