import { expect, test } from 'vitest'
import type { FindOperator } from 'typeorm'
import { ILike } from 'typeorm'
import {
  newPaginator,
  parsePathRelation,
  parseQueries,
} from '../../utils/paginatorHelper'

test('parsePathRelation should return empty object when params are empty', () => {
  const result = parsePathRelation('', '' as unknown as FindOperator<string>)
  expect(result).toStrictEqual({})
})

test('parsePathRelation should return object with params for path as firstParameters', () => {
  const result = parsePathRelation('company.name', ILike('%name%'))
  expect(result).toStrictEqual({
    company: {
      name: ILike('%name%'),
    },
  })
})

test('parse Queries should return default page, limit', () => {
  const {
    page,
    limit,
    search,
    filters,
    withDeleted,
    orderBy,
  } = parseQueries({ query: {} } as any)

  expect(page).toStrictEqual(1)
  expect(limit).toStrictEqual(20)
  expect(search).toBeNull()
  expect(filters).toBeNull()
  expect(withDeleted).toBeFalsy()
  expect(orderBy).toBeNull()
})

test('parse Queries should return params passed by request page, limit', () => {
  const {
    page,
    limit,
    search,
    filters,
    withDeleted,
    orderBy,
  } = parseQueries({

    query: {
      page: '2',
      limit: '200',
    },
  } as any)
  expect(page).toStrictEqual(2)
  expect(limit).toStrictEqual(200)
  expect(search).toBeNull()
  expect(filters).toBeNull()
  expect(withDeleted).toBeFalsy()
  expect(orderBy).toBeNull()
})

test('parse Queries should return params passed by request page, limit, search, filters, withDeleted', () => {
  const {
    page,
    limit,
    search,
    filters,
    withDeleted,
    orderBy,
  } = parseQueries({
    query: {
      page: '2',
      limit: '200',
      search: 'name',
      withDeleted: true,
      filters: {
        firstName: 'test',
      },
      orderBy: {
        firstName: 'ASC',
      },
    },
  } as any)
  expect(page).toStrictEqual(2)
  expect(limit).toStrictEqual(200)
  expect(search).toStrictEqual(ILike('%name%'))
  expect(filters).toStrictEqual({
    firstName: 'test',
  })
  expect(withDeleted).toBeTruthy()
  expect(orderBy).toStrictEqual({
    firstName: 'ASC',
  })
})

test('Pagniator send defaults filter', () => {
  const { page, take, skip, where, order, withDeleted } = newPaginator({
    req: { query: {} } as any,
    searchableFields: [],
    relationFields: [],
  })

  expect(page).toStrictEqual(1)
  expect(take).toStrictEqual(20)
  expect(skip).toStrictEqual(0)
  expect(where).toStrictEqual([])
  expect(order).toStrictEqual({
    id: 'DESC',
    createdAt: 'DESC',
  })
  expect(withDeleted).toBeFalsy()
})

test('Pagniator format correctly filters with filters', () => {
  const { page, take, skip, where, order, withDeleted } = newPaginator({
    req: {
      query: {
        page: '2',
        limit: '200',
        search: 'name',
        withDeleted: true,
        filters: {
          firstName: 'test',
        },
        orderBy: {
          lastName: 'ASC',
        },
      },
    } as any,
    searchableFields: ['firstName'],
    relationFields: ['company.name'],
  })

  expect(page).toStrictEqual(2)
  expect(take).toStrictEqual(200)
  expect(skip).toStrictEqual(200)
  expect(where).toStrictEqual([
    {
      firstName: 'test',
    },
    {
      company: {
        name: ILike('%name%'),
      },
    },
    {
      firstName: ILike('%name%'),
    },
  ])
  expect(order).toStrictEqual({
    firstName: 'ASC',
    lastName: 'ASC',
  })
  expect(withDeleted).toBeTruthy()
})
