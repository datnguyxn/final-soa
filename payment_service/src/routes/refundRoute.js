const express = require('express')
const router = express.Router()

const {refundMoMo, refundVnPay} = require("../controllers/refundController")

router.post("/refund-momo", refundMoMo)
router.post("/refund-vnpay", refundVnPay)


module.exports = router