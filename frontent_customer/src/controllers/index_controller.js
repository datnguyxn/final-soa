const axios = require("axios");
const getPage = async (req, res) => {
  let name;
  let resCart,
    carts = {},
    length = 0;
  if (req.session.customer) {
    name = req.session.customer.name;
    resCart = await axios.get("http://localhost:3456/api/cart", {
      params: {
        customerId: req.session.customer._id,
      },
    });
    console.log(resCart.data);
    carts = resCart.data.carts;
    length = resCart.data.length;
  }
  const response = await axios.get(
    "http://localhost:3456/api/product/getRandom"
  );
  const products = response.data;

  res.render("index", { products: products, name, carts, length });
};

module.exports = { getPage };
