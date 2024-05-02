import express from 'express';
import config from './src/config/config.js';
import variables from "./src/config/variables.js";
import route from './routes.js';
const app = express();

config(app);

const PORT = variables.PORT;

const URL = variables.URL;
route(app);
app.listen(PORT, () => {
    console.log(`Server is running on ${URL + ":" + PORT}.`);
});