import { beforeEach, describe, expect, jest, test } from '@jest/globals'
import type { Request } from 'express'
import checkUserRole from '../../middlewares/checkUserRole'
import { Role } from '../../types/Role'
import Context from '../../context'
import type { UserEntity } from '../../entity/UserEntity'

describe('Without Context', () => {
  test('checkUserRole throw error when context does not exist', () => {
    expect(() =>
      checkUserRole(Role.ADMIN)({} as any, undefined as any, jest.fn() as any))
      .toThrowError('Une erreur s\‘est produite')
  })
})

describe('checkUserRole throw errors when role is wrong', () => {
  const req = { headers: { } } as Request
  beforeEach(() => {
    Context.bind(req)
    const ctx: null | Context = Context.get(req)
    if (ctx) {
      ctx.user = { roles: Role.USER } as UserEntity
    }
  })

  test('checkUserRole throw error when user has USER role', () => {
    expect(() =>
      checkUserRole(Role.ADMIN)(req, jest.fn() as any, jest.fn() as any))
      .toThrowError('Action non autorisée')
  })

  test('checkUserRole throw error when user has OWNER role', () => {
    expect(() =>
      checkUserRole(Role.OWNER)(req, jest.fn() as any, jest.fn() as any))
      .toThrowError('Action non autorisée')
  })

  test('checkUserRole throw error when user has DEVELOPER role', () => {
    expect(() =>
      checkUserRole(Role.DEVELOPER)(req, jest.fn() as any, jest.fn() as any))
      .toThrowError('Action non autorisée')
  })

  test('checkUserRole throw error when user has EMPLOYEE role', () => {
    expect(() =>
      checkUserRole(Role.EMPLOYEE)(req, jest.fn() as any, jest.fn() as any))
      .toThrowError('Action non autorisée')
  })

  test('checkUserRole throw error when user has PHOTOGRAPHER role', () => {
    expect(() =>
      checkUserRole(Role.PHOTOGRAPHER)(req, jest.fn() as any, jest.fn() as any))
      .toThrowError('Action non autorisée')
  })

  test('checkUserRole throw error when user has SUPER_USER role', () => {
    expect(() =>
      checkUserRole(Role.SUPER_USER)(req, jest.fn() as any, jest.fn() as any))
      .toThrowError('Action non autorisée')
  })

  test('checkUserRole throw error when user\'s roles does not includes USER', () => {
    expect(() =>
      checkUserRole([
        Role.SUPER_USER,
        Role.PHOTOGRAPHER,
        Role.EMPLOYEE,
        Role.ADMIN,
        Role.DEVELOPER,
        Role.OWNER,
      ])(req, jest.fn() as any, jest.fn() as any))
      .toThrowError('Action non autorisée')
  })

  test('Check user role send void by use next function when role is alloawed', () => {
    expect(() =>
      checkUserRole(Role.USER)(req, jest.fn() as any, jest.fn() as any))
      .not.toThrowError('Action non autorisée')
  })
})
