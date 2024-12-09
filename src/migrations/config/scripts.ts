import { MigrationScript } from "../../types/Migrations"
import {
  addUserTest1689256415633,
  addNotificationTokenToUser,
  SeedTestAdminUser1708691709145,
  CreateSettingsEntities1733776782367,
} from "../migrations"

export const migrationScripts: MigrationScript[] = [
  {
    version: 0,
    name: 'addUserTest1689256415633',
    script: addUserTest1689256415633
  },
  {
    version: 1,
    name: 'addNotificationTokenToUser',
    script: addNotificationTokenToUser,
  },
  {
    version: 2,
    name: 'SeedTestAdminUser1708691709145',
    script: SeedTestAdminUser1708691709145,
  },
  {
    version: 3,
    name: 'CreateSettingsEntities1733776782367',
    script: CreateSettingsEntities1733776782367,
  },
]
