import axios from "axios";
import moment from "moment";

const getAllOrder = async (req, res) => {
    const { role, fullname, avt } = req.session.user;
    let { page, pageSize, search, orderType } = req.query;
    page = page ? parseInt(page, 10) : 1;
    pageSize = pageSize ? parseInt(pageSize, 10) : 6;
    console.log({ page, pageSize, search, orderType })
    // Create a MongoDB query object based on search criteria
    // Set default values if not provided
    const orderResponse = await axios.get("http://localhost:3458/api/order/all-order?page=" + page + "&pageSize=" + pageSize + "&search=" + search + "&orderType=" + orderType);
    console.log(orderResponse.data)
    res.render("order", {
        orders: orderResponse.data.plainOrder,
        avt,
        fullname,
        role,
        totalPages: orderResponse.data.totalPages,
        search: orderResponse.data.search,
        pagination: orderResponse.data.pagination,
        orderType: orderResponse.data.orderType, // Pass orderType to view for retaining filter selection
    });
};

export {
    getAllOrder
}