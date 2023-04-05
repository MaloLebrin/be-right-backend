import { entities } from './src/entity'

export const dataBaseConfig = {
  production: {
    name: 'production',
    type: 'postgres',
    host: 'postgres',
    port: 5432,
    username: process.env.DB_USERNAME_PROD,
    password: process.env.DB_PASSWORD_PROD,
    database: 'be-right-db',
    url: process.env.DATABASE_URL,
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
    host: 'postgres',
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
    host: process.env.HOSTNAME_TEST,
    port: process.env.POSTGRES_PORT_TEST,
    username: process.env.DB_USERNAME_TEST,
    password: process.env.DB_PASSWORD_TEST,
    url: process.env.DATABASE_URL_TEST,
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
