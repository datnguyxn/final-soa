const express = require('express')
const router = express.Router()

const {paymentWithMomo, ipnMoMo, getMomoReturnPage, paymentWithVNPAY, returnUrlVnPay, paymentWithCod} = require("../controllers/paymentController")

router.post("/payment-momo", paymentWithMomo)
router.post("/ipn-momo", ipnMoMo);
router.get("/momo_return", getMomoReturnPage);

router.post("/payment-vnpay", paymentWithVNPAY)
router.get("/vnpay_return", returnUrlVnPay)

router.post("/payment-cod", paymentWithCod)
module.exports = router