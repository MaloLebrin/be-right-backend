import dotenv from 'dotenv'
import { parseBoolean } from './utils/basicHelper'

export function useEnv() {
  dotenv.config()

  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: parseInt(process.env.PORT!),

    DATABASE_URL: process.env.DATABASE_URL,
    DB_USERNAME_PROD: process.env.DB_USERNAME_PROD,
    DB_PASSWORD_PROD: process.env.DB_PASSWORD_PROD,

    // DB TEST
    HOSTNAME_TEST: process.env.HOSTNAME_TEST,
    POSTGRES_PORT_TEST: process.env.POSTGRES_PORT_TEST,
    DB_USERNAME_TEST: process.env.DB_USERNAME_TEST,
    DB_PASSWORD_TEST: process.env.DB_PASSWORD_TEST,
    DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,

    MAIL_ADRESS: process.env.MAIL_ADRESS,
    MAIL_MDP: process.env.MAIL_MDP,
    MJ_APIKEY_PUBLIC: process.env.MJ_APIKEY_PUBLIC,
    MJ_APIKEY_PRIVATE: process.env.MJ_APIKEY_PRIVATE,
    IS_FEATURE_MAIL_ENABLED: parseBoolean(process.env.IS_FEATURE_MAIL_ENABLED),

    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_FIRTNAME: process.env.ADMIN_FIRTNAME,
    ADMIN_LASTNAME: process.env.ADMIN_LASTNAME,

    FRONT_URL: process.env.FRONT_URL,
    JWT_SECRET: process.env.JWT_SECRET,

    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_PORT: process.env.REDIS_PORT,
    CONCURRENT_WORKERS: process.env.CONCURRENT_WORKERS,

    GEO_CODING_API_URL: process.env.GEO_CODING_API_URL,

    BROWSERLESS_API_KEY: process.env.BROWSERLESS_API_KEY,
    STRIPE_PRIVATE_KEY: process.env.STRIPE_PRIVATE_KEY,
  }
}
