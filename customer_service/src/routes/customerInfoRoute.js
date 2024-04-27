const express = require("express");
const router = express.Router();

const {createShippingInfo, getShippingInfo, getCustometById} = require("../controllers/customerInfoController");

router.post("/create-shipping-info", createShippingInfo);
router.get("/get-shipping-info", getShippingInfo);
router.get("/get-customer-by-id", getCustometById)

module.exports = router