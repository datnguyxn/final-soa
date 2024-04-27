const express = require("express");
const router = express.Router();

const {getCategories, createCategory, updateCategory, deleteCategory} = require("../controllers/categoryController");

router.get("/", getCategories);
router.post('/create', createCategory)
router.post('/edit', updateCategory)
router.delete('/delete/:id', deleteCategory)
module.exports = router;


