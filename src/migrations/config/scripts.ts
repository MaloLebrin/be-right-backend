import { MigrationScript } from "../../types/Migrations"
import {
  addUserTest1689256415633,
  RemovedPaymentEntityMigrations,
} from "../migrations"

export const migrationScripts: MigrationScript[] = [
  {
    version: 0,
    name: 'addUserTest1689256415633',
    script: addUserTest1689256415633
  },
  {
    version: 1,
    name: 'RemovedPaymentEntity',
    script: RemovedPaymentEntityMigrations,
  }
]
