require("dotenv").config();
const express = require("express");
const configViewEngine = require("./config/viewEngine");


const product_route = require("./routes/product_route");
const category_route = require("./routes/category_route");
const order_route = require("./routes/order_route");

const app = express(); // app exprexx
const port = process.env.PORT || 3000; // port

configViewEngine(app);

app.use("/product", product_route);
app.use("/category", category_route);
app.use("/order", order_route);

app.listen(port, () => console.log(`http://localhost:${port}`));

