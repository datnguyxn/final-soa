import express from "express";
import {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} from "../controller/category.controller.js";

const router = express.Router();

router.get("/", getCategories);
router.post("/create", createCategory);
router.post("/edit", updateCategory);
router.delete("/delete/:id", deleteCategory);

export default router;