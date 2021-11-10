
const config: any = {
  name: 'default',
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'test',
  password: 'test',
  database: 'be-right-db',
  synchronize: true,
  entities: ['./entity/*.ts'],
}
export default config