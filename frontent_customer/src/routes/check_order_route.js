const express = require('express')
const router = express.Router()

const {getPage} = require("../controllers/check_order_controller")

router.get("/", getPage)

module.exports = router