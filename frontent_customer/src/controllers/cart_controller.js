const axios = require("axios");
const addCart = async (req, res) => {
  if (!req.session.customer) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const { productId, quantity, price, selectedCapacity, selectedColor } =
    req.body;
  const customerId = req.session.customer._id;
  const response = await axios.post("http://localhost:3456/api/cart/add", {
    productId: productId,
    quantity: quantity,
    price: price,
    selectedCapacity: selectedCapacity,
    selectedColor: selectedColor,
    customerId: customerId,
  });
  if(response.status === 200) {
    const cart = response.data.cart;
    res.status(200).json({ message: "Add cart successfully" , cart});
  }
};

const updateQuantity = async (req, res) => {
  const { productId, quantityElement, capacity, color } = req.body;
  console.log(req.body);
  let customerId;
  if(req.session.customer) {
    customerId = req.session.customer._id;
  }
  const response = await axios.put("http://localhost:3456/api/cart/updateQuantity", {
    productId: productId,
    quantityElement: quantityElement,
    customerId: customerId,
    selectedCapacity: capacity,
    selectedColor: color,
  });
  if(response.status === 200) {
    const cart = response.data.cart;
    res.status(200).json({ message: "Update cart successfully" , cart});
  } else {
    res.status(400).json({
      message: "Sản phẩm đã hết",
      quantityInStock: response.data.quantityInStock,
    });
  }
}

const deleteCart = async (req, res) => {
  const { productId } = req.body;
  let customerId;
  if(req.session.customer) {
    customerId = req.session.customer._id;
  }
  const response = await axios.delete("http://localhost:3456/api/cart/delete", {
    data: {
      productId: productId,
      customerId: customerId,
    }
  });
  if(response.status === 200) {
    const cart = response.data.cart;
    res.status(200).json({ message: "Delete cart successfully" , cart});
  }

}

module.exports = { addCart, updateQuantity, deleteCart };
