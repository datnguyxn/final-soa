const axios = require("axios");
const { param } = require("../../../order_service/src/routes/orderRoute");
const getPage = async (req, res) => {
  let name, order;
  if (req.session.customer) {
    name = req.session.customer.name;
    const response = await axios.get(
      "http://localhost:3458/api/order/order-of-user",
      {
        params: {
          customerId: req.session.customer._id,
        },
      }
    );

    order = response.data;
  }

  res.render("check_order", { name, order });
};

module.exports = { getPage };
