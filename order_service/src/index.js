require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require('cors');

const orderRoute = require("./routes/orderRoute");

const connectDb = require("./config/dbConnection");
connectDb();

const app = express(); // app exprexx
const port = process.env.PORT || 3000; // port

app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(function (req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

app.use("/api/order", orderRoute);

app.listen(port, () => console.log(`http://localhost:${port}`));
