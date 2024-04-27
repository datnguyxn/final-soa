const axios = require('axios');
const getCategory = async (req, res) => {
    const response = await axios.get("http://localhost:3456/api/category/");
    const categories = response.data.categories;
    res.render("category", { categories });
}

module.exports = {getCategory}