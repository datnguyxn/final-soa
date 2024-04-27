const Favorite = require("../models/favorite");
const Product = require("../models/product");
const getProductInfo = async (productId) => {
  try {
    const product = await Product.findById(productId).exec();
    if (product) {
      return {
        productName: product.name,
        image: product.image,
        brand: product.brand,
        id: product._id,
      };
    } else {
      console.error("Product not found");
      return {
        productName: "Unknown Product",
        image: "Unknown Image URL",
        brand: "Unknown Brand",
        id: "Unknown ID",
      };
    }
  } catch (error) {
    console.error("Error fetching product info:", error.message);
    return {
      productName: "Unknown Product",
      image: "Unknown Image URL",
      brand: "Unknown Brand",
    };
  }
};

const addFavorite = async (req, res) => {
  try {
    const { productId, customerId } = req.body;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(402).json({ message: "Product not found" });
    }

    let favorite = await Favorite.findOne({ customerId });
    if (!favorite) {
      favorite = new Favorite({
        customerId,
        productIds: [productId],
      });
    } else {
      favorite.productIds.push(productId);
    }
    await favorite.save();
    return res.status(200).json({ message: "Product added to favorite" });
  } catch (error) {
    console.error("Error adding favorite:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const removeFavorite = async (req, res) => {
  try {
    const { productId, customerId } = req.body;
    console.log(productId, customerId);
    const product = await Product.findById(productId);
    if (!product) {
      return res.json({ message: "Product not found" });
    }

    let favorite = await Favorite.findOne({ customerId });
    if (!favorite) {
      return res.status(403).json({ message: "Favorite not found" });
    }
    favorite.productIds = favorite.productIds.filter((id) => id != productId);
    await favorite.save();
    return res
      .status(200)
      .json({ success: true, message: "Product removed from favorite" });
  } catch (error) {
    console.error("Error removing favorite:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const getFavorite = async (req, res) => {
  try {
    const customerId = req.body.customerId || req.query.customerId;
    const favorite = await Favorite.findOne({
      customerId,
    }).exec();
    if (favorite) {
      const productIds = favorite.productIds;
      const products = await Promise.all(
        productIds.map(async (productId) => {
          return await getProductInfo(productId);
        })
      );
      res.status(200).json({ products: products });
    } else {
      res.status(200).json({ products: [] });
    }
  } catch (error) {
    console.error("Error getting favorite:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

const checkFavorite = async (req, res) => {
  try {
    const { productId, customerId } = req.body;
    const favorite = await Favorite.findOne({ customerId });
    if (!favorite) {
      return res.status(200).json({ isFavorite: false });
    }
    const isFavorite = favorite.productIds.includes(productId);
    return res.status(200).json({ isFavorite });
  } catch (error) {
    console.error("Error checking favorite:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
}

module.exports = { addFavorite, removeFavorite, getFavorite, checkFavorite };
