import express from "express";

import config from "./src/config/config.js";
import variables from "./src/config/variables.js";
import {
    default as homeRoute
} from "./src/route/home.route.js";
import {
    default as posRoute
} from "./src/route/pos.route.js";
import {
    default as orderRoute
} from "./src/route/order.route.js";
import {
    default as productRoute
} from "./src/route/product.route.js";
import {
    default as categoryRoute
} from "./src/route/category.route.js"
import {
    default as reportRoute
} from "./src/route/report.route.js";
import {
    default as staffRoute
} from "./src/route/staff.route.js";
import {
    default as customerRoute
} from "./src/route/customer.route.js";
import {
    default as profileRoute
} from "./src/route/profile.route.js";
import isAuthenticated from "./src/middleware/auth.middleware.js";

const app = express();
config(app);
app.use("/", homeRoute);
app.use("/pos", isAuthenticated, posRoute);
app.use("/order", isAuthenticated, orderRoute);
app.use("/product", isAuthenticated, productRoute);
app.use("/category", isAuthenticated, categoryRoute);
app.use("/report", isAuthenticated, reportRoute);
app.use("/staff", isAuthenticated, staffRoute);
app.use("/customer", isAuthenticated, customerRoute);
app.use("/profile", isAuthenticated, profileRoute);
app.use("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("http://localhost:3002/");
});
app.listen(variables.PORT, () => {
    console.log(`Server is running on port ${variables.URL}:${variables.PORT}`);
});