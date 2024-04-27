require("dotenv").config();
const express = require("express");
const configViewEngine = require("./config/viewEngine");


const index_route = require("./routes/index_route");
const auth_route = require("./routes/auth_route");
const cart_route = require("./routes/cart_route");
const shop_route = require("./routes/shop_route");
const detail_route = require("./routes/detail_route");
const favorite_route = require("./routes/favorite_route");
const check_order_route = require("./routes/check_order_route");
const checkout_route = require("./routes/checkout_route");

const app = express(); // app exprexx
const port = process.env.PORT || 3000; // port

configViewEngine(app);


app.use("/index", index_route);
app.use("/auth", auth_route);
app.use("/cart", cart_route);
app.use("/shop", shop_route);
app.use("/product-detail", detail_route);
app.use("/favorite", favorite_route);
app.use("/check-order", check_order_route)
app.use("/checkout", checkout_route);

app.listen(port, () => console.log(`http://localhost:${port}`));
