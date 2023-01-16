import type { Request, Response } from 'express'
import { SHA256 } from 'crypto-js'
import encBase64 from 'crypto-js/enc-base64'
import { DataSource, Like } from 'typeorm'
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { dataBaseConfig } from '../ormconfig'
import { isSubscriptionOptionField } from './utils/userHelper'
import type { SubscriptionEnum } from './types/Subscription'
import { useLogger } from './middlewares/loggerService'
import { useEnv } from './env'
import type { FileEntity } from './entity/FileEntity'
import type { UserEntity } from './entity/UserEntity'

/**
 * create hash password
 * @param salt string
 * @param password string recieved by front
 * @returns hash saved in DB
 */
export const generateHash = (salt: string, password: string) => {
  const hash = SHA256(password + salt).toString(encBase64)
  return hash
}

/**
 * function to build where params for searchable request. Build for searchable inputs
 * @param searchableFields form an entity must be strings[]
 * @param req req to find query and search value
 * @returns filters build with searchable fields form entity as key, and search value
 */
export const generateWhereFieldsByEntity = (searchableFields: string[], req: Request) => {
  const search = req.query.search ? Like(`%${req.query.search}%`) : null
  const fields = searchableFields

  // Need to filter fields for searching if isSubscriptionOptionField is false
  // because typeorm doesn't support search string in Enum field
  if (!isSubscriptionOptionField(search as unknown as SubscriptionEnum)) {
    const index = fields.findIndex(field => field === 'subscription')
    if (index !== -1) {
      fields.splice(index, 1)
    }
  }
  const filters = fields.map(field => {
    // here we need to check if field is a subscription field beacause Typeorm doesn't support search string in Enum field
    if (isSubscriptionOptionField(search as unknown as SubscriptionEnum)) {
      return {
        subscription: search,
      }
    }
    return {
      [field]: search,
    }
  })
  return filters
}

/**
 * @param entity UserEntity
 * @returns entity filtered without any confidential fields
 */
export const userResponse = (entity: UserEntity) => {
  const entityReturned = {} as Record<string, any>
  for (const [key, value] of Object.entries(entity)) {
    if (key !== 'password' && key !== 'salt') {
      entityReturned[key] = value
    }
    if (key === 'profilePicture' && value) {
      const picture = value as FileEntity
      entityReturned[key] = picture.secure_url
    }
  }
  return entityReturned
}

/**
 * function to manage pagination filters query must be write like this filters[field]=value
 * @param req to find queries
 * @returns queries then pass them to find() entity
 */
export const paginator = (req: Request, searchableField: string[]) => {
  const page = req.query.page ? parseInt(req.query.page.toString()) : 1
  const limit = req.query.limit ? Math.abs(parseInt(req.query.limit.toString())) : 5
  const search = req.query.search ? Like(`%${req.query.search}%`) : null

  return {
    page,
    take: limit,
    skip: (page - 1) * limit,
    where: req.query.filters ? req.query.filters : search && searchableField.length ? generateWhereFieldsByEntity(searchableField, req) : null,
  }
}

export function toCent(value: number) {
  return value * 100
}

export async function wrapperRequest<T>(req: Request, res: Response, request: () => Promise<T>) {
  const { logger } = useLogger()
  try {
    logger.info(`${req.url} route accessed`)
    await request()
  } catch (error) {
    console.error(error)
    logger.debug(error.message)
    if (error.status) {
      return res.status(error.status || 500).json({ error: error.message })
    }
    return res.status(400).json({ error: error.message })
  } finally {
    logger.info(`${req.url} route ended`)
  }
}

export async function clearDB(APP_SOURCE: DataSource) {
  const entities = APP_SOURCE.entityMetadatas
  for (const entity of entities) {
    const repository = await APP_SOURCE.getRepository(entity.name)
    await repository.query(`TRUNCATE ${entity.tableName} RESTART IDENTITY CASCADE;`)
  }
}

export function createAppSource() {
  const {
    NODE_ENV,
  } = useEnv()

  let connectionsOptions: PostgresConnectionOptions

  if (NODE_ENV === 'production') {
    connectionsOptions = {
      ...dataBaseConfig.production as unknown as PostgresConnectionOptions,
    }
  } else if (NODE_ENV === 'test') {
    connectionsOptions = {
      ...dataBaseConfig.test as unknown as PostgresConnectionOptions,
    }
  } else {
    connectionsOptions = {
      ...dataBaseConfig.dev as unknown as PostgresConnectionOptions,
      name: 'default',
    }
  }

  return new DataSource({
    ...connectionsOptions,
  })
}

// eslint-disable-next-line promise/param-names
export const delay = (ms: number) => new Promise(res => setTimeout(res, ms))
