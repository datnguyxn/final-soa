const express = require('express')
const router = express.Router()

const {getPage, createShippingInfo, callApiIpnMoMo, getMomoReturnPage, getVnPayReturnPage, getCodReturnPay, getCodReturn} = require("../controllers/checkout_controller")

router.get("/", getPage)
router.post("/shipping-info", createShippingInfo)
router.post("/ipn", callApiIpnMoMo)
router.get("/momo_return", getMomoReturnPage)

router.get("/vnpay_return", getVnPayReturnPage)

router.post("/payment-cod", getCodReturnPay)
router.get("/cod_return", getCodReturn)
module.exports = router