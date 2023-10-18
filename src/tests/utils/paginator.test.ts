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
  const result = parseQueries({ query: {} } as any)
  expect(result.page).toStrictEqual(1)
  expect(result.limit).toStrictEqual(20)
  expect(result.search).toBeNull()
  expect(result.filters).toBeNull()
  expect(result.withDeleted).toBeFalsy()
})

test('parse Queries should return params passed by request page, limit', () => {
  const result = parseQueries({
    query: {
      page: '2',
      limit: '200',
    },
  } as any)
  expect(result.page).toStrictEqual(2)
  expect(result.limit).toStrictEqual(200)
  expect(result.search).toBeNull()
  expect(result.filters).toBeNull()
  expect(result.withDeleted).toBeFalsy()
})

test('parse Queries should return params passed by request page, limit, search, filters, withDeleted', () => {
  const result = parseQueries({
    query: {
      page: '2',
      limit: '200',
      search: 'name',
      withDeleted: true,
      filters: {
        firstName: 'test',
      },
    },
  } as any)
  expect(result.page).toStrictEqual(2)
  expect(result.limit).toStrictEqual(200)
  expect(result.search).toStrictEqual(ILike('%name%'))
  expect(result.filters).toStrictEqual({
    firstName: 'test',
  })
  expect(result.withDeleted).toBeTruthy()
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

test('Pagniator format correctly filters', () => {
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
    createdAt: 'DESC',
    firstName: 'ASC',
    id: 'DESC',
  })
  expect(withDeleted).toBeTruthy()
})
