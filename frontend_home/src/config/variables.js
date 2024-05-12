import dotenv from 'dotenv';

dotenv.config();

export default {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    URL: process.env.URL,
}