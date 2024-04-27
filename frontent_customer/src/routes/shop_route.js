const express = require('express')
const router = express.Router()

const {getPage} = require ("../controllers/shop_controller")

router.get("/", getPage)

module.exports = router