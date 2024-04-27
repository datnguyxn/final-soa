const Cart = require("../models/cart");
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

const addCart = async (req, res) => {
  try {
    const {
      productId,
      quantity,
      price,
      selectedCapacity,
      selectedColor,
      customerId,
    } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(402).json({ message: "Product not found" });
    }

    const capacity = product.capacities.find(
      (capacity) => capacity.capacity === selectedCapacity
    );
    // Find the selected color in the selected capacity
    const color = capacity.colors.find(
      (color) => color.color === selectedColor
    );
    // Check if there is enough stock for the selected color
    if (color.quantityInStock < quantity) {
      return res
        .json({ message: "Not enough stock for the selected color" });
    }

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      cart = new Cart({ customerId: customerId, items: [] });
    }
    //check existing item in cart

    const existingItem = cart.items.find(
      (item) =>
        item.productId.equals(productId) &&
        item.color === selectedColor &&
        item.capacity === selectedCapacity
    );

    if (existingItem) {
      if (color.quantityInStock < existingItem.quantity + quantity) {
        return res.status(400).json({ message: "Sản phẩm đã hết hàng" });
      }
      existingItem.quantity += quantity;
    } else {
      if (color.quantityInStock < quantity) {
        return res.status(400).json({ message: "Sản phẩm đã hết hàng" });
      }
      cart.items.push({
        productId,
        quantity,
        price,
        color: selectedColor,
        capacity: selectedCapacity,
      });
    }

    await cart.save();

    const formattedCarts = {
      items: await Promise.all(
        cart.items.map(async (item) => {
          const { productName, image, brand, id } = await getProductInfo(
            item.productId
          );
          return {
            ...item,
            productName: productName,
            brand: brand,
            image: image,
            id: id,
            price: formatCurrency(item.price),
            quantity: item.quantity,
            color: item.color,
            capacity: item.capacity,
          };
        })
      ),
    };
    res.status(200).json({
      message: "Product added to cart successfully",
      cart: formattedCarts,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const formatCurrency = (amount) => {
  const formattedAmount = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
  return formattedAmount;
};

const deleteCartItem = async (req, res) => {
  try {
    const { productId, customerId } = req.body;
    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const itemIndex = cart.items.findIndex((item) =>
      item.productId.equals(productId)
    );
    if (itemIndex > -1) {
      cart.items.splice(itemIndex, 1);
      await cart.save();
      res.status(200).json({
        message: "Product removed from cart successfully",
        cart: cart.items,
      });
    } else {
      res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCartItemQuantity = async (req, res) => {
  try {
    const {
      productId,
      quantityElement,
      customerId,
      selectedColor,
      selectedCapacity,
    } = req.body;

    // Fetch the product from the database
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    const capacity = product.capacities.find(
      (capacity) => capacity.capacity === selectedCapacity
    );

    // Check if capacity is undefined
    if (!capacity) {
      return res.json({ message: "Selected capacity not found" });
    }

    // Find the selected color in the selected capacity
    const color = capacity.colors.find(
      (color) => color.color === selectedColor
    );

    // Check if color is undefined
    if (!color) {
      return res
        .status(404)
        .json({ message: "Selected color not found in selected capacity" });
    }

    let cart = await Cart.findOne({ customerId });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    const item = cart.items.find(
      (item) =>
        item.productId.equals(productId) &&
        item.color === selectedColor &&
        item.capacity === selectedCapacity
    );

    if (!item) {
      return res.status(404).json({ message: "Product not found in cart" });
    }

    // Check if there is enough stock
    if (color.quantityInStock < quantityElement) {
      return res.status(400).json({
        message: "Sản phẩm đã hết",
        quantityInStock: color.quantityInStock,
      });
    }

    item.quantity = quantityElement;

    await cart.save();
    res.status(200).json({
      message: "Product quantity updated successfully",
      cart: cart.items,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getCart = async (req, res) => {
  try {
    const customerId = req.body.customerId || req.query.customerId;
    console.log(customerId);

    const carts = await Cart.findOne({ customerId }).exec();
    if (!carts) {
      return res.json({ message: "Cart not found" });
    }
    let formattedCarts = {};
    if (carts && carts.items) {
      formattedCarts = {
        items: await Promise.all(
          carts.items.map(async (item) => {
            const { productName, image, brand } = await getProductInfo(
              item.productId
            );
            return {
              ...item,
              productName: productName,
              brand: brand,
              image: image,
              id: item.productId,
              price: item.price,
              unitPrice: formatCurrency(item.price),
              quantity: item.quantity,
              color: item.color,
              capacity: item.capacity,
            };
          })
        ),
      };
    }
    const totalAmount = carts.items.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    res.status(200).json({
      carts: formattedCarts.items || [],
      length: carts && carts.items ? carts.items.length : 0,
      totalAmount: formatCurrency(totalAmount),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const clearCart = async (req, res) => {
  try {
    const customerId = req.body.customerId || req.query.customerId || req.params.customerId;
    console.log(customerId);
    const cart = await Cart.findOne({ customerId });
    if (cart) {
      await Cart.deleteOne({ customerId });
      console.log("Cart cleared successfully");
      res.status(200).json({ message: "Cart cleared successfully" });
    } else {
      console.log("Cart not found");
      res.json({ message: "Cart not found" });
    }
  } catch {
    console.error(`Error clearing cart: ${error}`);
  }
};
module.exports = {
  addCart,
  deleteCartItem,
  updateCartItemQuantity,
  getCart,
  clearCart,
};
