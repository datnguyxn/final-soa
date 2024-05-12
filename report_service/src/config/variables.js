import dotenv from "dotenv";

dotenv.config();

export default {
    PORT: process.env.PORT,
    URL: process.env.URL,
    MONGO_URL: process.env.MONGO_URL ,
}