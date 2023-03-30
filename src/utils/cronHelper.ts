export enum CronJobInterval {
  EVERY_30_SECONDS = '*/30 * * * * *',
  EVERY_MINUTE = '* * * * * ',
  EVERY_30_MINUTES = '*/30 * * * *',
  EVERY_HOUR = '0 0 * * * *',
  EVERY_DAY_MIDNIGHT = '59 23 * * *',
  EVERY_DAY_4_AM = '0 12 * * *',
  EVERY_FIRST_DAY_MONTH_MIDNIGHT = '0 0 1 * *',
}
