import { MigrationCustomInterface } from "../../types/Migrations"
import { logger } from "../../middlewares/loggerService"

export async function RemovedPaymentEntityMigrations({
  name,
  SOURCE,
  QueryRunner,
}: MigrationCustomInterface) {
  try {
    logger.info(`Migration ${name} started`)


    await QueryRunner.query(`
      ALTER TABLE
        subscription_entity
      DROP COLUMN 
        "paymentId"
      CASCADE;
    `)

    await QueryRunner.query(`
      ALTER TABLE
      	user_entity
      ADD COLUMN IF NOT EXISTS
      	"stripeCustomerId"
      	VARCHAR;    
    `)

    await QueryRunner.query(`
      ALTER TABLE
        user_entity
      ADD CONSTRAINT IF NOT EXISTS
        "Uniq_Strip_Customer_Id"
      UNIQUE ("stripeCustomerId");
    `)

  } catch (error) {
    logger.error(`An error occurred for migration ${name} `, error)
  } finally {
    logger.info(`Migration ${name} ended`)
  }
}
