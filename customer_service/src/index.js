require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");

const authRoute = require("./routes/authRoute");
const customerInfoRoute = require("./routes/customerInfoRoute");

const connectDb = require("./config/dbConnection");
connectDb();

const app = express(); // app exprexx
const port = process.env.PORT || 3000; // port

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.setHeader("Access-Control-Allow-Credentials", true);
    next();
  });

app.use("/auth", authRoute);
app.use("/api/customer-info", customerInfoRoute);

app.listen(port, () => console.log(`http://localhost:${port}`));
