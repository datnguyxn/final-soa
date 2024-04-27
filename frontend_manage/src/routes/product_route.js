const express = require('express')
const router = express.Router()

const {getAddProduct, getProducts, getEditProduct}  = require ("../controllers/product_controller")

router.get("/addProduct", getAddProduct)
router.get("/", getProducts)
router.get("/edit/:id", getEditProduct)

module.exports = router