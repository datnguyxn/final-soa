const express = require("express");
const router = express.Router();
const multer = require("multer");

const {
  getProductInManage,
  createProduct,
  deleteProduct,
  updateProduct,
  getOptionProduct,
  getProductById,
  get4RandomProducts,
  getProductInShop,
  getDetailProduct,
  getColorPriceWithCapacity,
  updateProductStock,
  getProductWithOutId,
  getAllProducts,
  getProductByBarCodeButDataIsNumber,
  getProductByBarCodeButDataIsString,
  getProductByQuery,
  updateProductWhenOrder
} = require("../controllers/productController");

const storage = multer.diskStorage({
  destination: "./src/public/uploads",
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + "_" + uniqueSuffix + "_" + file.originalname);
  },
});
const upload = multer({ storage }).single("imgPd");

router.get("/", getProductInManage);
router.get("/getRandom", get4RandomProducts);
router.post("/addProduct", upload, createProduct);
router.get("/updateStock", updateProductStock);
router.post("/update/:id", upload, updateProduct);
router.get("/delete/:id", deleteProduct);
router.post("/option", getOptionProduct);
router.get("/detail/:id", getDetailProduct);
router.get("/shop", getProductInShop);
router.post("/colorPriceWithCapacity", getColorPriceWithCapacity);

router.get("/getProductWithOutId", getProductWithOutId);
router.get("/getAllProducts", getAllProducts);
router.get("/getProductByBarCodeButDataIsNumber", getProductByBarCodeButDataIsNumber);
router.get("/getProductByBarCodeButDataIsString", getProductByBarCodeButDataIsString);
router.get("/getProductByQuery", getProductByQuery);
router.get("/updateProductWhenOrder/:id", updateProductWhenOrder);
router.get("/:id", getProductById);

module.exports = router;
