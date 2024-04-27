const express = require('express')
const router = express.Router()

const {addCart, updateQuantity, deleteCart} = require ("../controllers/cart_controller")

router.put('/updateQuantity', updateQuantity)
router.post("/add", addCart)
router.delete("/delete", deleteCart)


module.exports = router