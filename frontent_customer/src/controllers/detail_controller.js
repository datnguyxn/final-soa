const axios = require("axios");

const getDetailProduct = async (req, res) => {
  let id = req.params.id;
  let name;
  let resCart,
    carts = {},
    length = 0;
  let isFavorite;
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
    const responseFav = await axios.post(
      "http://localhost:3456/api/favorite/check",
      {
        customerId: req.session.customer._id,
        productId: id,
      }
    );
    isFavorite = responseFav.data.isFavorite;
  }

  const response = await axios.get(
    `http://localhost:3456/api/product/detail/${id}`
  );

  res.render("product-detail", {
    product: response.data.product,
    minPriceColor: response.data.minPriceColor,
    minPriceCapacity: response.data.minPriceCapacity,
    capacitiesWithMinPrice: response.data.capacitiesWithMinPrice,
    capacitiesWithColors: response.data.capacitiesWithColors,
    carts,
    length,
    name,
    isFavorite
  });
};

module.exports = { getDetailProduct };
