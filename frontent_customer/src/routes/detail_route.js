const express = require('express')
const router = express.Router()

const {getDetailProduct} = require("../controllers/detail_controller")

router.get("/:id", getDetailProduct)

module.exports = router
