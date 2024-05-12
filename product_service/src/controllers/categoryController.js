const Category = require("../models/category");
const moment = require("moment");
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find().exec();
    const plainCategories = categories.map((category) => ({
      ...category.toJSON(),
      created: moment(category.created).format("DD/MM/YYYY HH:mm:ss"),
    }));

    res.json({ categories: plainCategories });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};



const createCategory = async (req, res) => {
  try {
    const name = req.body.name;
    const category = new Category({ name });
    await category.save();
    res.json({ success: true, message: "Category added successfully" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = req.body.id;
    const newName = req.body.name;

    const category = await Category.findOneAndUpdate(
      { _id: id },
      { name: newName },
      { new: true }
    );

    if (!category) {
      res.json({ success: false, message: "Category not found" });
    }
    res.json({ success: true, message: "Category updated successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error updating category" });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.deleteOne({ _id: id }).exec();
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Error deleting category" });
  }
};

const getCategory = async (req, res) => {
  try {
    const categories = await Category.find().exec();
    res.json(categories);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
  updateCategory,
  getCategory
};
