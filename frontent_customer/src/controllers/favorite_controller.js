const axios = require("axios");
const getPage = async (req, res) => {
  let name, id;
  if (req.session.customer) {
    name = req.session.customer.name;
    id = req.session.customer._id;
  }
  const response = await axios.get("http://localhost:3456/api/favorite", {
    params: {
      customerId: id,
    },
  });
  const products = response.data.products;

  res.render("favorite", { products, name });
};

const addFavorite = async (req, res) => {
  if (!req.session.customer) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { productId } = req.body;
  const customerId = req.session.customer._id;
  const response = await axios.post("http://localhost:3456/api/favorite/add", {
    productId: productId,
    customerId: customerId,
  });
  if (response.status === 200) {
    res.status(200).json({ message: "Add favorite successfully" });
  }
};

const deleteFavorite = async (req, res) => {
  if (!req.session.customer) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { productId } = req.body;
  let customerId;
  if (req.session.customer) {
    customerId = req.session.customer._id;
  }
  const response = await axios.post(
    "http://localhost:3456/api/favorite/remove",
    {
      productId: productId,
      customerId: customerId,
    }
  );
  if (response.status === 200) {
    res.status(200).json({ message: "Delete favorite successfully" });
  }
};
module.exports = { getPage, addFavorite, deleteFavorite };
