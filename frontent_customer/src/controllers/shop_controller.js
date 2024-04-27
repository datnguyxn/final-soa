const axios = require("axios");
const favorite = require("../../../product_service/src/models/favorite");

const getPage = async (req, res) => {
  let resCart,
    carts = {},
    length = 0;
  favorites = [];
  let name;
  if (req.session.customer) {
    name = req.session.customer.name;
    resCart = await axios.get("http://localhost:3456/api/cart", {
      params: {
        customerId: req.session.customer._id,
      },
    });
    carts = resCart.data.carts;
    length = resCart.data.length;
  }
  let { page, pageSize, search, category, brand, sort_price } = req.query;

  const response = await axios.get("http://localhost:3456/api/product/shop", {
    params: { page, pageSize, search, category, brand, sort_price },
  });
  const responseCategory = await axios.get(
    "http://localhost:3456/api/category"
  );

  const products = response.data.products;
  if (req.session.customer) {
    // Create an array of promises for the favorite checks
    const favoriteChecks = products.map((product) =>
      axios.post("http://localhost:3456/api/favorite/check", {
        customerId: req.session.customer._id,
        productId: product._id,
      })
    );

    // Wait for all favorite checks to complete
    const favoriteResults = await Promise.all(favoriteChecks);
    // Add the isFavorite field to the products
    for (let i = 0; i < products.length; i++) {
      products[i].isFavorite = favoriteResults[i].data.isFavorite;
    }
  }
  res.render("shop", {
    products: products,
    brands: response.data.brands,
    totalPages: response.data.totalPages,
    pagination: response.data.pagination,
    categories: responseCategory.data.categories,
    name,
    carts,
    length,
  });
};

module.exports = { getPage };
