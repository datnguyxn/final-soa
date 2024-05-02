import dotenv from 'dotenv';
dotenv.config();

export default {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    PORT_EMAIL: process.env.PORT_EMAIL,
    URL: process.env.URL,
    MONGO_URI: process.env.DATABASE_URL ,
    JWT_ACCESS: process.env.JWT_ACCESS_TOKEN,
    JWT_REFRESH: process.env.JWT_REFRESH_TOKEN,
    JWT_ACCESS_EXPIRES: process.env.JWT_ACCESS_EXPIRES,
    JWT_REFRESH_EXPIRES: process.env.JWT_REFRESH_EXPIRES,
    JWT_TOKEN_ACTIVE: process.env.JWT_TOKEN_ACTIVE,
}