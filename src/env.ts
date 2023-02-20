export function useEnv() {
  return {
    NODE_ENV: process.env.NODE_ENV,
    PORT: parseInt(process.env.PORT!),

    DATABASE_URL: process.env.DATABASE_URL,
    DB_USERNAME_PROD: process.env.DB_USERNAME_PROD,
    DB_PASSWORD_PROD: process.env.DB_PASSWORD_PROD,

    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
    CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
    CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,

    MAIL_ADRESS: process.env.MAIL_ADRESS,
    MAIL_MDP: process.env.MAIL_MDP,
    MJ_APIKEY_PUBLIC: process.env.MJ_APIKEY_PUBLIC,
    MJ_APIKEY_PRIVATE: process.env.MJ_APIKEY_PRIVATE,

    ADMIN_EMAIL: process.env.ADMIN_EMAIL,
    ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    ADMIN_FIRTNAME: process.env.ADMIN_FIRTNAME,
    ADMIN_LASTNAME: process.env.ADMIN_LASTNAME,

    FRONT_URL: process.env.FRONT_URL,
    JWT_SECRET: process.env.JWT_SECRET,

    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PASSWORD: process.env.REDIS_PASSWORD,
    REDIS_PORT: process.env.REDIS_PORT,

    GEO_CODING_API_URL: process.env.GEO_CODING_API_URL,
  }
}
