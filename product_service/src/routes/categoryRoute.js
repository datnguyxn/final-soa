const express = require("express");
const router = express.Router();

const {getCategories, createCategory, updateCategory, deleteCategory, getCategory} = require("../controllers/categoryController");

router.get('/getCategory', getCategory)
router.get("/", getCategories);
router.post('/create', createCategory)
router.post('/edit', updateCategory)
router.delete('/delete/:id', deleteCategory)
module.exports = router;


