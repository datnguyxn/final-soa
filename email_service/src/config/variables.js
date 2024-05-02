import dotenv from 'dotenv';
dotenv.config();

export default {
    ENV: process.env.ENV,
    PORT: process.env.PORT,
    URL: process.env.URL,
    EMAIL_HOST: process.env.SMTP_HOST,
    EMAIL_PORT: process.env.SMTP_PORT,
    EMAIL_USER: process.env.MAIL,
    EMAIL_PASS: process.env.MAIL_PASSWORD,
}