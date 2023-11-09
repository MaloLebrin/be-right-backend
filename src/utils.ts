import type { NextFunction, Request, Response } from 'express'
import { SHA256 } from 'crypto-js'
import encBase64 from 'crypto-js/enc-base64'
import { DataSource } from 'typeorm'
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions'
import { dataBaseConfig } from '../ormconfig'
import { logger } from './middlewares/loggerService'
import { useEnv } from './env'
import { isProduction } from './utils/envHelper'
import Context from './context'

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

export async function wrapperRequest<T>(req: Request, res: Response, next: NextFunction, request: (ctx: Context) => Promise<T>) {
  try {
    logger.info(`${req.url} route accessed`)
    const ctx = Context.get(req)
    await request(ctx)
  } catch (error) {
    if (!isProduction()) {
      logger.debug(error.message)
    }

    logger.error(error)

    next(error)
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
