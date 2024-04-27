const axios = require("axios");
const { param } = require("../routes/order_route");
const getPage = async (req, res) => {
    let { page, pageSize, search, orderType } = req.query;
    const response = await axios.get("http://localhost:3458/api/order/all-order", {params: {page, pageSize, search, orderType}});
    console.log(response.data);
    res.render("order", {orders: response.data.orders, pagination: response.data.pagination, search, orderType, totalPages: response.data.totalPages});
}

module.exports = {
    getPage,
};