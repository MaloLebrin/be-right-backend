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
    extra: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
    entities: [
      'build/src/entity/**/*.js',
    ],
    migrations: [
      'build/src/migrations/**/*.js',
    ],
    subscribers: [
      'build/src/subscriber/**/*.js',
    ],
    cli: {
      entitiesDir: 'src/entity',
      migrationsDir: 'src/migration',
      subscribersDir: 'src/subscriber',
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
    synchronize: false,
    logging: false,
    entities: [
      'build/src/entity/**/*.js',
    ],
    migrations: [
      'build/src/migrations/**/*.js',
    ],
    subscribers: [
      'build/src/subscriber/**/*.js',
    ],
    cli: {
      entitiesDir: 'src/entity',
      migrationsDir: 'src/migration',
      subscribersDir: 'src/subscriber',
    },
  },
}
