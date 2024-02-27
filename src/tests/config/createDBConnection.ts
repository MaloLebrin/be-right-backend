import { DataSource } from 'typeorm'

export async function createDBConnection() {
  const db = new DataSource({
    name: 'default',
    type: 'better-sqlite3',
    database: ':memory:',
    entities: ['src/entity/**/*.ts'],
    synchronize: true,
  })
  await db.initialize()
  return db
}
