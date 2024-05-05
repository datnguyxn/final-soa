import express from 'express';
import variables from '././src/config/variables.js';
import connect from '././src/config/database.connect.js';
import Table from 'ascii-table';
import routes from "./routes.js";
import morgan from "morgan";
import session from 'express-session';

const table = new Table('App Configuration');

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(morgan('combined'));

const dbConnectStatus = await connect();

app.use(
  session({
    secret: "my-secret-key",
    resave: false,
    saveUninitialized: false,
  })
);


const PORT = variables.PORT;

const URL = variables.URL;

const COLUMNS_NAME = ['Status', 'Message'];
table.setHeading(...COLUMNS_NAME);
table.addRow(dbConnectStatus.status, dbConnectStatus.message);
routes(app)
app.listen(PORT, () => {
    console.log(table.toString());
    console.log(`Server is running on ${URL + ":" + PORT}.`);
});