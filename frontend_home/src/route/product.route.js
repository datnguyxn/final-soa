import express from "express";
import {
    getProducts,
    getEditProduct,
    getAddProduct,
    createProduct,
    deleteProduct,
    updateProduct
} from "../controller/product.controller.js";
import multer from "multer";

const storage = multer.diskStorage({
    destination: "./src/public/uploads",
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(null, file.fieldname + "_" + uniqueSuffix + "_" + file.originalname);
    },
});
const upload = multer({ storage }).single("imgPd");

const router = express.Router();

router.get("/", getProducts);
router.get("/addProduct", getAddProduct);
router.post("/addProduct", upload, createProduct)
router.get("/edit/:id", getEditProduct);
router.post("/update/:id", upload, updateProduct)
router.get("/delete/:id",deleteProduct)

export default router;