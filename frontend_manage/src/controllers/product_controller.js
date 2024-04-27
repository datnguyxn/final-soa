const axios = require("axios");
const { get } = require("http");
const getAddProduct = async (req, res) => {
    // const {
    //   name,
    //   email,
    //   role,
    //   state,
    //   _id,
    //   lastname,
    //   firstname,
    //   birthday,
    //   phone,
    //   avt,
    // } = req.session.user;
    // const categories = await Category.find({ active: true }).exec();
  
    // res.render("addProduct", { role, firstname, avt, categories });
    const response = await axios.get("http://localhost:3456/api/category/");
    const categories = response.data.categories;
    res.render("add_product", { categories });
  };

  const getProducts = async (req, res) => {
    const response = await axios.get("http://localhost:3456/api/product/", {params: req.query});
    const products = response.data.products;
    const pagination = response.data.pagination;
    const totalPages = response.data.totalPages;
    res.render("product", { products , pagination, totalPages});
  }

  const getEditProduct = async (req, res) => {
    const response = await axios.get("http://localhost:3456/api/category/");
    const categories = response.data.categories;
    const responseProduct = await axios.get(`http://localhost:3456/api/product/${req.params.id}`);
    const product = responseProduct.data;
    res.render("edit_product", { product: product, categories });
  };

  module.exports = {
    getAddProduct, getProducts, getEditProduct
  }


