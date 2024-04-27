const express = require("express");
const router = express.Router();

const {addCart, deleteCartItem, updateCartItemQuantity, getCart, clearCart} = require("../controllers/cartController");

router.post("/add", addCart);
router.delete('/delete',deleteCartItem)
router.put('/updateQuantity',updateCartItemQuantity)
router.get("/", getCart);
router.delete("/clear", clearCart);
module.exports = router;