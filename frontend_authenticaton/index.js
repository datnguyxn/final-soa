import express from "express";
import config from "./src/config/config.js";
import dotenv from "dotenv";
import {
    default as authRoute
} from "./src/route/auth.route.js";
dotenv.config();

const app = express();
config(app);

// const router = express.Router();
app.get('/', (req, res) => {
    res.render("sign-in");
});

app.use('/auth', authRoute);

app.listen(process.env.PORT, () => {
    console.log(`Server is running on port ${process.env.URL}:${process.env.PORT}`);
});