import express from "express";
import {
    index,
    addToCart,
    getCart,
    clearCart,
    removeFromCart,
    getCus,
    getProduct,
    getCategory
} from "../controller/pos.controller.js";

const router = express.Router();

router.get("/", index);
router.post('/addToCart', addToCart);
router.post('/clearCart', clearCart);
router.get('/getCart', getCart)
router.post('/removeFromCart', removeFromCart);
router.post('/getCus', getCus);
router.post('/getProduct', getProduct);
router.post('/search', getCategory);

export default router;