import axios from "axios";
import * as fs from "fs";

const getProducts = async (req, res) => {
    const {email, role, fullname} = req.session.user;
    const response = await axios.get("http://localhost:3456/api/product/", {params: req.query});
    let products = response.data.products;
    const pagination = response.data.pagination;
    const totalPages = response.data.totalPages;
    products = products.map(product => {
        return {
            ...product,
            role
        }
    });
    res.render("product", {role, fullname, products, pagination, totalPages});
}

const getEditProduct = async (req, res) => {
    const response = await axios.get("http://localhost:3456/api/category/");
    const categories = response.data.categories;
    const responseProduct = await axios.get(`http://localhost:3456/api/product/${req.params.id}`);
    const product = responseProduct.data;
    res.render("editProduct", {product: product, categories});
};

const getAddProduct = async (req, res) => {
    const {email, role, fullname} = req.session.user;
    const categoryResponse = await axios.get("http://localhost:3456/api/category/getCategory");
    const categories = categoryResponse.data.categories;
    res.render("addProduct", {role, fullname, categories});
}

const createProduct = async (req, res) => {
    try {
        const {
            barcode,
            capacities,
            namePd,
            video_url,
            product_category,
            brand,
            description
        } = req.body;
        const file = req.file.filename;
        const productResponse = await axios.post("http://localhost:3456/api/product/addProduct", {
            barcode,
            capacities,
            namePd,
            video_url,
            product_category,
            brand,
            description,
            file
        });
        console.log(productResponse.data);
        if (productResponse.data) {
            req.session.message = {
                type: "success",
                message: "Product added successfully",
            };
            return res.redirect("/product")
        } else {
            console.log(productResponse.data)
            req.session.message = {
                type: "danger",
                message: "Failed to add product",
            };
            return res.redirect("/product/addProduct")

        }
    } catch (e) {
        console.log(e)
        res.status(500).json({message: e.message})
    }
}

const updateProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const newImage = req.file.filename;
        const {
            capacities,
            namePd,
            product_category,
            brand,
            barcode,
            video_url,
            description
        } = req.body;
        const updatedProductResponse = await axios.post("http://localhost:3456/api/product/update/" + id, {
            capacities,
            namePd,
            product_category,
            brand,
            barcode,
            video_url,
            description,
            newImage
        });
        const updatedProduct = updatedProductResponse.data;
        console.log(updatedProduct)
        req.session.message = {
            type: "success",
            message: "Product updated successfully",
        };
        return res.redirect("/product");
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: e.message,
        };
        res.redirect("/product")
    }
}

const deleteProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const deletedProductResponse = await axios.get("http://localhost:3456/api/product/delete/" + id);
        const deletedProduct = deletedProductResponse.data;
        if (deletedProduct) {
            try {
                fs.unlinkSync(`./src/public/uploads/${deletedProduct.image}`);
                req.session.message = {
                    type: "danger",
                    message: "Product deleted successfully",
                };
            } catch (err) {
                console.log(err);
                req.session.message = {
                    type: "danger",
                    message: "Không thể xóa sản phẩm",
                };
            }
            return res.redirect("/product");
        }
    } catch (e) {
        console.log(e)
        res.status(500).json({message: e.message})
    }
}

export {
    getProducts,
    getEditProduct,
    getAddProduct,
    createProduct,
    deleteProduct,
    updateProduct
}