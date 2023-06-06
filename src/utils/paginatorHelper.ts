/* eslint-disable security/detect-object-injection */
import type { FindOperator, FindOptionsOrder, FindOptionsWhere } from 'typeorm'
import { ILike } from 'typeorm'
import type { BaseEntity } from '../entity/bases/BaseEntity'

function parsePathRelation(path: string, search: FindOperator<string>) {
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

interface Paginator {
  search?: string
  page?: number
  limit?: number
  filters?: any
  searchableFields?: string[]
  relationFields?: string[]
}

interface PaginatorReturnType<T extends BaseEntity> {
  page: number
  take: number
  skip: number
  where: FindOptionsWhere<T>[]
  order: FindOptionsOrder<T>
}

export function newPaginator<T extends BaseEntity>({
  search = '',
  page = 1,
  limit = 20,
  filters,
  searchableFields = [],
  relationFields = [],
}: Paginator): PaginatorReturnType<T> {
  const where = []

  const order = {
    id: 'DESC',
    createdAt: 'DESC',
  } as FindOptionsOrder<T>

  if (filters) {
    where.push(filters)
  }

  if (search) {
    const searchValue = ILike(`%${search}%`)

    if (relationFields.length > 0) {
      relationFields.forEach(item => {
        const t = parsePathRelation(item, searchValue)
        where.push(t)
      })
    }

    if (searchableFields.length > 0) {
      searchableFields.forEach(item => {
        order[item] = 'ASC'
        where.push({ [item]: searchValue })
      })
    }
  }

  return {
    page,
    take: limit,
    skip: (page - 1) * limit,
    where,
    order,
  }
}
