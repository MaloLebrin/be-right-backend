/* eslint-disable security/detect-object-injection */
import type { FindOperator, FindOptionsOrder, FindOptionsWhere } from 'typeorm'
import { ILike } from 'typeorm'
import type { Request } from 'express'
import { deepMerge } from '@antfu/utils'
import type { BaseEntity } from '../entity/bases/BaseEntity'

interface Paginator {
  req: Request
  searchableFields?: string[]
  relationFields?: string[]
}

interface PaginatorReturnType<T extends BaseEntity> {
  page: number
  take: number
  skip: number
  where: FindOptionsWhere<T>[]
  order: FindOptionsOrder<T>
  withDeleted?: boolean
}

interface ParseQueriesReturnType<T> {
  page: number
  limit: number
  search: FindOperator<string>
  filters: FindOptionsWhere<T> | null
  andFilters: FindOptionsWhere<T> | null
  orderBy: FindOptionsOrder<T>
  withDeleted?: boolean
}

export function parsePathRelation(path: string, search: FindOperator<string>) {
  const dir = {}

  const paths = path.split('.')

  paths.reduce((dir, path) => {
    const lastElement = paths[paths.length - 1]
    if (path) {
      return path === lastElement ? (dir[path] = search) : (dir[path] = {})
    }
    return dir
  }, dir)
  return dir
}

export function parseQueries<T>(req: Request): ParseQueriesReturnType<T> {
  return {
    page: req.query.page ? parseInt(req.query.page.toLocaleString()) : 1,
    limit: req.query.limit ? Math.abs(parseInt(req.query.limit.toString())) : 20,
    search: req.query.search ? ILike(`%${req.query.search.toLocaleString()}%`) : null,
    filters: req.query.filters as FindOptionsWhere<T> || null,
    andFilters: req.query.andFilters as FindOptionsWhere<T> || null,
    withDeleted: req.query.withDeleted?.toString() === 'true',
    orderBy: req.query.orderBy as FindOptionsOrder<T> || null,
  }
}

export function newPaginator<T extends BaseEntity>({
  req,
  searchableFields = [],
  relationFields = [],
}: Paginator): PaginatorReturnType<T> {
  const {
    andFilters,
    filters,
    limit,
    orderBy,
    page,
    search,
    withDeleted,
  } = parseQueries(req)

  let where = []

  let order: FindOptionsOrder<T> | null = null

  if (!orderBy) {
    order = {
      id: 'DESC',
      createdAt: 'DESC',
    } as FindOptionsOrder<T>
  } else {
    order = orderBy
  }

  if (filters) {
    where.push(filters)
  }

  if (search) {
    if (relationFields.length > 0) {
      relationFields.forEach(item => {
        const t = parsePathRelation(item, search)
        where.push(t)
      })
    }

    if (searchableFields.length > 0) {
      searchableFields.forEach(item => {
        order[item] = 'ASC'
        where.push({ [item]: search })
      })
    }
  }

  if (andFilters) {
    const whereFilters = [...where]
    if (whereFilters.length > 0) {
      where = whereFilters.map(filter => deepMerge(filter, andFilters))
    } else {
      where.push(andFilters)
    }
  }

  return {
    page,
    take: limit,
    skip: (page - 1) * limit,
    where,
    order,
    withDeleted,
  }
}

export function composeWhereFieldForQueryBuilder({
  alias,
  andFilters,
  filters,
}: {
  alias: string
  andFilters: FindOptionsWhere<any> | null
  filters: FindOptionsWhere<any> | null
}) {
  if (!alias) {
    throw new Error('Alias is required')
  }

  const andWhere: { key: string; params: Record<string, string | number> }[] = []
  const orWhere: { key: string; params: Record<string, string | number> }[] = []

  if (filters) {
    for (const [key, value] of Object.entries(filters)) {
      orWhere.push({
        key: `${alias}.${key} = :${key}`,
        params: { [key]: value },
      })
    }
  }

  if (andFilters) {
    for (const [key, value] of Object.entries(andFilters)) {
      andWhere.push({
        key: `${alias}.${key} = :${key}`,
        params: { [key]: value },
      })
    }
  }

  return {
    andWhere,
    orWhere,
  }
}
