import axios from "axios";

const index = async (req, res) => {
    try {
        const userResponse = req.session.user;
        const customerResponse = await axios.get("http://localhost:3457/api/customer-info/get-customer");
        const productResponse = await axios.get("http://localhost:3456/api/product/getProductWithOutId");
        const categoryResponse = await axios.get("http://localhost:3456/api/category/getCategory");
        res.render("pos", {
            name: userResponse.fullname,
            email: userResponse.email,
            role: userResponse.role,
            customers: customerResponse.data,
            products: productResponse.data,
            categories: categoryResponse.data
        });
    } catch (e) {
        console.log(e);
        res.status("error", {
            message: e.message
        });
    }
}


let shoppingCart = [];
const addToCart = (req, res) => {
    const { productName, productPrice, productId } = req.body;
    shoppingCart.push({ productName, productPrice, productId });
    res.json({ message: "Product added to cart" });
};

const getCart = (req, res) => {
    res.json(shoppingCart);
};

const clearCart = (req, res) => {
    shoppingCart = [];
    res.json({ message: "Cart cleared" });
};

const removeFromCart = (req, res) => {
    const { productName } = req.body;
    const index = shoppingCart.findIndex(
        (item) => item.productName === productName
    );

    if (index !== -1) {
        shoppingCart.splice(index, 1);
        res.json({ success: true, message: "Product removed from cart" });
    } else {
        res.json({ success: false, message: "Product not found in cart" });
    }
};

const getCus = async (req, res) => {
    try {
        let payload = req.body.payload;
        let search = await axios.get("http://localhost:3457/api/customer-info/search-customer/?phone=" + payload);
        res.send({ payload: search.data });
    } catch (error) {
        res.status(500).send({ error: "Lỗi truy vấn dữ liệu khách hàng" });
    }
};

const getProduct = async (req, res) => {
    try {
        let payload = req.body.payload;
        console.log(payload)
        const productResponse = await axios.get("http://localhost:3456/api/product/getProductWithOutId");
        let search;
        // If payload is empty, return all products
        if (!payload || payload === "") {
            search = productResponse.data;
        } else {
            // If it's a number, search by each digit
            if (/^\d+$/.test(payload)) {
                const regexArray = payload.split("").map((char) => `.*${char}`);
                const regexString = regexArray.join("");
                search = await axios.get("http://localhost:3456/api/product/getProductByBarCodeButDataIsNumber/?barcode=" + regexString);
                search = search.data.slice(0, 8);
            } else {
                // If it's not a number, search by each character of the name
                const regexArray = payload.split("").map((char) => `.*${char}`);
                const regexString = regexArray.join("");
                search = await axios.get("http://localhost:3456/api/product/getProductByBarCodeButDataIsString/?barcode=" + regexString);
                search = search.data.slice(0, 8);
            }
        }
        console.log(search)

        res.send({ payload: search });
    } catch (error) {
        console.log(error)
        res.status(500).send({ error: "Lỗi" });
    }
};

const getCategory = async (req, res) => {
    const selectedCategory = req.query.poscat;

    try {
        const products = await axios.get("http://localhost:3456/api/product/getProductByQuery/?category=" + selectedCategory);
        res.json({ products: products.data})
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: error });
    }
};

export {index, addToCart, getCart, clearCart, removeFromCart, getCus, getProduct, getCategory};
