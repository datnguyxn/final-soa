import express from 'express'
import connectDatabase from "./src/config/connect.database.js";
import variables from "./src/config/variables.js";
import cors from 'cors';
import * as bodyParser from "express";
import {default as reportRoute} from "./src/route/report.route.js";
import morgan from "morgan";


const app = express();

connectDatabase();

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("combined"));
app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
});

app.use('/api/report', reportRoute);
app.listen(variables.PORT, () => {
    console.log(`Server is running on port ${variables.URL}:${variables.PORT}`);
});