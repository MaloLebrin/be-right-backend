import { describe, expect, test } from '@jest/globals'
import type { FindOperator } from 'typeorm'
import { ILike } from 'typeorm'
import {
  composeWhereFieldForQueryBuilder,
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
    andFilters,
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
  expect(andFilters).toBeNull()
})

test('parse Queries should return params passed by request page, limit, search, filters, withDeleted', () => {
  const {
    andFilters,
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
      andFilters: {
        company: {
          id: 2,
        },
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
  expect(andFilters).toStrictEqual({
    company: {
      id: 2,
    },
  })
})

test('Pagniator send defaults filter', () => {
  const {
    order,
    page,
    skip,
    take,
    where,
    withDeleted,
  } = newPaginator({
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
  const {
    order,
    page,
    skip,
    take,
    where,
    withDeleted,
  } = newPaginator({
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
        andFilters: {
          company: {
            id: 2,
          },
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
      company: {
        id: 2,
      },
    },
    {
      company: {
        name: ILike('%name%'),
        id: 2,
      },
    },
    {
      firstName: ILike('%name%'),
      company: {
        id: 2,
      },
    },
  ])
  expect(order).toStrictEqual({
    firstName: 'ASC',
    lastName: 'ASC',
  })
  expect(withDeleted).toBeTruthy()
})

test('Pagniator send andFilters only with no relationField and searchable fields', () => {
  const {
    order,
    page,
    skip,
    take,
    where,
    withDeleted,
  } = newPaginator({
    req: {
      query: {
        page: '1',
        limit: '20',
        search: 'name',
        andFilters: {
          company: {
            id: 2,
          },
        },
      },
    } as any,
    searchableFields: [],
    relationFields: [],
  })

  expect(page).toStrictEqual(1)
  expect(take).toStrictEqual(20)
  expect(skip).toStrictEqual(0)
  expect(where).toStrictEqual([
    {
      company: {
        id: 2,
      },
    },
  ])
  expect(order).toStrictEqual({
    id: 'DESC',
    createdAt: 'DESC',
  })
  expect(withDeleted).toBeFalsy()
})

test('Pagniator send andFilters only', () => {
  const {
    order,
    page,
    skip,
    take,
    where,
    withDeleted,
  } = newPaginator({
    req: {
      query: {
        page: '1',
        limit: '20',
        search: 'name',
        andFilters: {
          company: {
            id: 2,
          },
        },
      },
    } as any,
    searchableFields: ['firstName'],
    relationFields: ['company.name'],
  })

  expect(page).toStrictEqual(1)
  expect(take).toStrictEqual(20)
  expect(skip).toStrictEqual(0)
  expect(where).toStrictEqual([
    {
      company: {
        name: ILike('%name%'),
        id: 2,
      },
    },
    {
      firstName: ILike('%name%'),
      company: {
        id: 2,
      },
    },
  ])
  expect(order).toStrictEqual({
    id: 'DESC',
    firstName: 'ASC',
    createdAt: 'DESC',
  })
  expect(withDeleted).toBeFalsy()
})

test('Pagniator format correctly filters with filters', () => {
  const {
    order,
    page,
    skip,
    take,
    where,
    withDeleted,
  } = newPaginator({
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
        andFilters: {
          company: {
            id: 2,
          },
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
      company: {
        id: 2,
      },
    },
    {
      company: {
        name: ILike('%name%'),
        id: 2,
      },
    },
    {
      firstName: ILike('%name%'),
      company: {
        id: 2,
      },
    },
  ])
  expect(order).toStrictEqual({
    firstName: 'ASC',
    lastName: 'ASC',
  })
  expect(withDeleted).toBeTruthy()
})

describe('composeWhereFieldForQueryBuilder', () => {
  test('should throw new error when alias is falsy', () => {
    expect(() => {
      composeWhereFieldForQueryBuilder({
        alias: null as unknown as string,
        filters: null as unknown as Record<string, unknown>,
        andFilters: null as unknown as Record<string, unknown>,
      })
    }).toThrowError('Alias is required')
  })

  test('should return empty andWhere and orWhere when filters and andFilters are falsy', () => {
    const { orWhere, andWhere } = composeWhereFieldForQueryBuilder({
      alias: 'user',
      filters: null,
      andFilters: null,
    })

    expect(orWhere).toStrictEqual([])
    expect(andWhere).toStrictEqual([])
    expect(orWhere).toHaveLength(0)
    expect(andWhere).toHaveLength(0)
  })

  test('should return orWhere array with filters not empty', () => {
    const { orWhere } = composeWhereFieldForQueryBuilder({
      alias: 'user',
      filters: {
        id: 1,
      },
      andFilters: null,
    })

    expect(orWhere[0]).toStrictEqual({ key: 'user.id = :id', params: { id: 1 } })
    expect(orWhere).toHaveLength(1)
  })

  test('should return andWhere array with andFilters not empty', () => {
    const { andWhere } = composeWhereFieldForQueryBuilder({
      alias: 'user',
      filters: null,
      andFilters: {
        id: 1,
        firstName: 'test',
      },
    })

    expect(andWhere[0]).toStrictEqual({
      key: 'user.id = :id',
      params: { id: 1 },
    })
    expect(andWhere[1]).toStrictEqual({
      key: 'user.firstName = :firstName',
      params: { firstName: 'test' },
    })
    expect(andWhere).toHaveLength(2)
  })
})
