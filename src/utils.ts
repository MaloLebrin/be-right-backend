import type { Request, Response } from 'express'
import { SHA256 } from 'crypto-js'
import encBase64 from 'crypto-js/enc-base64'
import type { FindOptionsWhere } from 'typeorm'
import { DataSource, ILike } from 'typeorm'
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { dataBaseConfig } from '../ormconfig'
import { logger } from './middlewares/loggerService'
import { useEnv } from './env'
import type { ErrorType } from './types'

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
export const generateWhereFieldsByEntity = <T>(searchableFields: string[], req: Request): FindOptionsWhere<T> => {
  const search = req.query.search ? ILike(`%${req.query.search}%`) : null

  // const filters: Record<string, string> = {}
  const filters = searchableFields.map(field => {
    // here we need to check if field is a subscription field beacause Typeorm doesn't support search string in Enum field
    return {
      [field]: search,
    }
    // }
  })
  return filters as unknown as FindOptionsWhere<T>
}

/**
 * function to manage pagination filters query must be write like this filters[field]=value
 * @param req to find queries
 * @returns queries then pass them to find() entity
 */
export const paginator = <T>(req: Request, searchableField: string[]) => {
  const page = req.query.page ? parseInt(req.query.page.toString()) : 1
  const limit = req.query.limit ? Math.abs(parseInt(req.query.limit.toString())) : 5
  const search = req.query.search ? ILike(`%${req.query.search}%`) : null

  let where: FindOptionsWhere<T> | null = null

  if (req.query.filters) {
    where = req.query.filters as FindOptionsWhere<T>
  } else if (search && searchableField.length > 0) {
    where = generateWhereFieldsByEntity(searchableField, req)
  }

  return {
    page,
    take: limit,
    skip: (page - 1) * limit,
    where,
  }
}

export async function wrapperRequest<T>(req: Request, res: Response, request: () => Promise<T>) {
  try {
    logger.info(`${req.url} route accessed`)
    await request()
  } catch (err) {
    const error = err as ErrorType
    logger.debug(error.message)

    logger.error(error)

    return res.status(error.status || 500).send({
      success: false,
      message: error.message,
      stack: error.stack,
      description: error.cause,
    })
  } finally {
    logger.info(`${req.url} route ended`)
  }
}

export async function clearDB(APP_SOURCE: DataSource) {
  const entities = APP_SOURCE.entityMetadatas
  for (const entity of entities) {
    const repository = APP_SOURCE.getRepository(entity.name)
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
