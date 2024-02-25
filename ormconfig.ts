import { entities } from './src/entity'
import { useEnv } from './src/env'

const {
  DATABASE_URL,
  HOSTNAME_TEST,
  POSTGRES_PORT_TEST,
  DB_USERNAME_TEST,
  DB_PASSWORD_TEST,
  DATABASE_URL_TEST,
} = useEnv()

export const dataBaseConfig = {
  production: {
    name: 'production',
    type: 'postgres',
    url: DATABASE_URL,
    synchronize: true,
    logging: false,
    ssl: true,
    entities: [
      ...entities,
    ],
    migrations: [
      './src/migrations/**/*.js',
    ],
    subscribers: [
      './src/subscriber/**/*.js',
    ],
    cli: {
      entitiesDir: './src/entity',
      migrationsDir: './src/migrations',
      subscribersDir: './src/subscriber',
    },
  },

  dev: {
    name: 'dev',
    type: 'postgres',
    host: '127.0.0.1',
    port: 5432,
    username: 'test',
    password: 'test',
    database: 'be-right-db',
    synchronize: true,
    logging: false,
    entities: [
      // `${__dirname}/../**/*.entity{.ts,.js}`,
      ...entities,
    ],
    migrations: [
      './src/migrations/**/*.js',
    ],
    subscribers: [
      './src/subscriber/**/*.js',
    ],
    cli: {
      entitiesDir: './src/entity',
      migrationsDir: './src/migrations',
      subscribersDir: './src/subscriber',
    },
  },
  test: {
    name: 'test',
    type: 'postgres',
    host: HOSTNAME_TEST,
    port: POSTGRES_PORT_TEST,
    username: DB_USERNAME_TEST,
    password: DB_PASSWORD_TEST,
    url: DATABASE_URL_TEST,
    database: 'be-right-backend-db',
    synchronize: true,
    logging: false,
    entities: [
      // `${__dirname}/../**/*.entity{.ts,.js}`,
      ...entities,
    ],
    migrations: [
      './src/migrations/**/*.js',
    ],
    subscribers: [
      './src/subscriber/**/*.js',
    ],
    cli: {
      entitiesDir: './src/entity',
      migrationsDir: './src/migrations',
      subscribersDir: './src/subscriber',
    },
  },
}
