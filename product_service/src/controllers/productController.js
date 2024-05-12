const moment = require("moment");
const Product = require("../models/product");
const fs = require("fs");
const bwipjs = require("bwip-js");
const {get} = require("http");
// const Order = require("../models/order");
// const Category = require("../models/category");

const createProduct = async (req, res) => {
    try {
        const productUPC = req.body.barcode;
        const barcodeBase64 = await generateBarcode(productUPC);
        const capacities2 = req.body.capacities;
        console.log(capacities2);
        const capacities = req.body.capacities
            .map((capacity) => {
                const colors = capacity.colors
                    .map((color) => {
                        const serialNumbers = [];
                        const filteredColor = {
                            color: color.color,
                            price: color.price,
                            quantityInStock: color.quantityInStock,
                        };

                        if (color.quantityInStock === 0) {
                            filteredColor.serialNumbers = [];
                        } else {
                            for (let i = 0; i < color.quantityInStock; i++) {
                                serialNumbers.push(
                                    generateSerialNumber(capacity.capacity, color.color, i + 1)
                                );
                            }
                        }
                        filteredColor.serialNumbers = serialNumbers;

                        return filteredColor;
                    })
                    .filter(
                        (filteredColor) => filteredColor.color && filteredColor.price
                    ); // Remove colors without valid data

                return {
                    capacity: capacity.capacity,
                    colors: colors.length ? colors : null,
                };
            })
            .filter((filteredCapacity) => filteredCapacity.colors !== null); // Remove capacities without valid colors

        const product = new Product({
            image: req.body.file,
            name: req.body.namePd,
            url_video: req.body.video_url,
            category: req.body.product_category,
            brand: req.body.brand,
            barcode: barcodeBase64,
            barcodeUPC: productUPC,
            description: req.body.description,
            capacities: capacities,
        });

        await product.save();
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({error: err.message});
    }
};

function generateBarcode(productUPC) {
    return new Promise((resolve, reject) => {
        bwipjs.toBuffer(
            {
                bcid: "upca",
                text: productUPC,
                scale: 3,
                height: 10,
            },
            function (err, png) {
                if (err) {
                    reject(err);
                } else {
                    resolve(png.toString("base64"));
                }
            }
        );
    });
}

const formatCurrency = (amount) => {
    const formattedAmount = new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
    }).format(amount);
    return formattedAmount;
};

const getProductInManage = async (req, res) => {
    try {
        let {page, pageSize, search} = req.query;

        // Set default values if not provided
        page = page ? parseInt(page, 10) : 1;
        pageSize = pageSize ? parseInt(pageSize, 10) : 7;

        // Create a MongoDB query object based on search criteria
        const query = {};
        if (search) {
            query.name = {$regex: new RegExp(search, "i")}; // Case-insensitive search on the 'name' field
        }

        // Fetch products with pagination and search
        const products = await Product.find(query)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec();

        const totalProducts = await Product.countDocuments(query);

        const totalPages = Math.ceil(totalProducts / pageSize);

        const pagination = {
            pages: Array.from({length: totalPages}, (_, i) => ({
                page: i + 1,
                isCurrent: i + 1 === page,
            })),
            pageSize,
            currentPage: page,
            totalProducts,
        };

        // Include information about the previous and next pages
        if (page > 1) {
            pagination.prevPage = page - 1;
        }

        if (page < totalPages) {
            pagination.nextPage = page + 1;
        }

        const plainProducts = products.map((product) => ({
            ...product.toJSON(),
            created: moment(product.created).format("DD/MM/YYYY HH:mm:ss"),
        }));

        res.json({
            products: plainProducts,
            search,
            pagination,
            totalPages,
        });
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const getProductById = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findOne({_id: id}).exec();

        if (!product) {
            res.status(404).json({message: "Product not found"});
        }
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).json({message: err.message});
    }
};

const updateProduct = async (req, res) => {
    const id = req.params.id;
    const newImage = req.body.newImage;
    const capacities = req.body.capacities
        .map((capacity) => {
            const colors = capacity.colors
                .map((color) => {
                    // Kiểm tra xem trường nào không có giá trị và bỏ qua
                    const serialNumbers = [];
                    const filteredColor = {};
                    if (color.color) filteredColor.color = color.color;
                    if (color.price) filteredColor.price = color.price;
                    if (color.quantityInStock || color.quantityInStock === 0) {
                        // Ensure that quantityInStock is either defined or explicitly set to 0
                        filteredColor.quantityInStock = color.quantityInStock;
                        if (color.quantityInStock === 0) {
                            // Set serialNumbers to an empty array if quantityInStock is 0
                            filteredColor.serialNumbers = [];
                        } else {
                            // Generate serial numbers regardless of quantityInStock
                            for (let i = 0; i < color.quantityInStock; i++) {
                                serialNumbers.push(
                                    generateSerialNumber(capacity.capacity, color.color, i + 1)
                                );
                            }
                            filteredColor.serialNumbers = serialNumbers;
                        }
                    }
                    // if (color.quantityInStock)
                    //   filteredColor.quantityInStock = color.quantityInStock;
                    //   if (color.quantityInStock === 0) {
                    //     serialNumbers.push('XXX0');
                    //   } else {
                    //     for (let i = 0; i < color.quantityInStock; i++) {
                    //       serialNumbers.push(
                    //         generateSerialNumber(capacity.capacity, color.color, i + 1)
                    //       );
                    //     }
                    //   }
                    console.log(serialNumbers);
                    // filteredColor.serialNumbers = serialNumbers;
                    if (serialNumbers.length > 0) {
                        filteredColor.serialNumbers = serialNumbers;
                    }
                    // Tạo đối tượng màu sắc chỉ với các trường có giá trị

                    return filteredColor;
                })
                .filter((filteredColor) => filteredColor.color && filteredColor.price); // Loại bỏ các màu không có giá trị

            // Kiểm tra xem màu nào có dữ liệu và bỏ qua
            if (colors.length === 0) return null;

            // Tạo đối tượng dung lượng chỉ với các trường có giá trị
            return {
                capacity: capacity.capacity,
                colors: colors,
            };
        })
        .filter((filteredCapacity) => filteredCapacity !== null);

    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            {
                name: req.body.namePd,
                category: req.body.product_category,
                image: newImage,
                brand: req.body.brand,
                barcodeUPC: req.body.barcode,
                url_video: req.body.video_url,
                description: req.body.description,
                capacities: capacities,
            },
            {new: true}
        );

        if (!updatedProduct) {
            throw new Error("Product not found");
        }

        res.json({
            message: "Product updated successfully",
            product: updatedProduct,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: err.message});
    }
};

const deleteProduct = async (req, res) => {
    let id = req.params.id;

    try {
        // Check if the product is associated with any order
        // const isInOrder = await Order.exists({ "products.product_id": id });

        // if (isInOrder) {
        //   // Product is in an order, cannot delete
        //   req.session.message = {
        //     type: "danger",
        //     message: "Không thể xóa sản phẩm",
        //   };
        //   res.redirect("/product");
        //   return;
        // }

        // Product is not in any order, proceed with deletion
        const result = await Product.findOneAndDelete({_id: id}).exec();

        if (result && result.image !== "") {
            try {
                fs.unlinkSync("./src/public/uploads/" + result.image);
                console.log("Image deleted:", result.image);
            } catch (err) {
                console.log("Error deleting image:", err);
            }
        }

        res.json({message: "Product deleted successfully"});
    } catch (err) {
        res.status(500).json({message: err.message});
    }
};

const getOptionProduct = async (req, res) => {
    const id = req.body.id;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({message: "Product not found"});
        }
        const capacities = product.capacities;
        return res.json(capacities);
    } catch (error) {
        return res.status(500).json({message: error.message});
    }
};

const generateRandomString = (length) => {
    const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const generateSerialNumber = (capacity, color, index) => {
    const prefix = color.substring(0, 1).toUpperCase();
    const capacityCode = capacity;
    const randomString = generateRandomString(5);
    const serialNumber = `${prefix}${capacityCode}${index
        .toString()
        .padStart(3, "0")}${randomString}`;
    return serialNumber;
};

// --------------------------------------------------------------------- //

const getProductInfo = async (productId) => {
    try {
        const product = await Product.findById(productId).exec();
        if (product) {
            return {
                productName: product.name,
                image: product.image,
                brand: product.brand,
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

const get4RandomProducts = async (req, res) => {
    try {
        const products = await Product.aggregate([{$sample: {size: 4}}]); // Lấy ngẫu nhiên 4 sản phẩm
        const productsWithMinPrices = await Promise.all(
            products.map(async (product) => {
                const minPriceColor = product.capacities.reduce(
                    (minColor, capacity) => {
                        const minCapacityColor = capacity.colors.reduce((min, color) => {
                            return color.price < min.price ? color : min;
                        }, capacity.colors[0]); // Sử dụng phần tử đầu tiên của mảng colors làm giá trị khởi tạo

                        return minCapacityColor.price < minColor.price
                            ? minCapacityColor
                            : minColor;
                    },
                    product.capacities[0].colors[0]
                ); // Sử dụng phần tử đầu tiên của mảng capacities[0].colors làm giá trị khởi tạo

                // Trả về sản phẩm với giá thấp nhất của mỗi sản phẩm
                return {
                    _id: product._id,
                    name: product.name,
                    image: product.image,
                    brand: product.brand,
                    minPrice: minPriceColor.price,
                    // Các thông tin khác mà bạn muốn bao gồm trong đây
                };
            })
        );
        res.json(productsWithMinPrices);
    } catch (error) {
        console.error("Error fetching random products:", error.message);
        res.status(500).json({message: error.message});
    }
};

const getProductInShop = async (req, res) => {
    try {
        let {page, pageSize, search, category, brand, sort_price} = req.query;
        page = page ? parseInt(page, 10) : 1;
        pageSize = pageSize ? parseInt(pageSize, 10) : 12;
        const query = {};
        if (search) {
            query.name = {$regex: new RegExp(search, "i")};
        }
        if (category) {
            query.category = category;
        }
        if (brand) {
            query.brand = brand;
        }
        let sortOption = {};
        if (sort_price === "asc") {
            sortOption = {retailPrice: 1}; // Sắp xếp tăng dần theo giá
        } else if (sort_price === "desc") {
            sortOption = {retailPrice: -1}; // Sắp xếp giảm dần theo giá
        }

        // Fetch products with pagination, search, and sorting
        const products = await Product.find(query)
            .sort(sortOption)
            .skip((page - 1) * pageSize)
            .limit(pageSize)
            .exec();

        const totalProducts = await Product.countDocuments(query);

        const totalPages = Math.ceil(totalProducts / pageSize);

        const pagination = {
            pages: Array.from({length: totalPages}, (_, i) => ({
                page: i + 1,
                isCurrent: i + 1 === page,
            })),
            pageSize,
            currentPage: page,
            totalProducts,
        };

        // Include information about the previous and next pages
        if (page > 1) {
            pagination.prevPage = page - 1;
        }

        if (page < totalPages) {
            pagination.nextPage = page + 1;
        }

        const plainProducts = await Promise.all(
            products.map(async (product) => {
                const minPriceColor = product.capacities.reduce(
                    (minColor, capacity) => {
                        const minCapacityColor = capacity.colors.reduce((min, color) => {
                            return color.price < min.price ? color : min;
                        }, capacity.colors[0]);
                        return minCapacityColor.price < minColor.price
                            ? minCapacityColor
                            : minColor;
                    },
                    product.capacities[0].colors[0]
                );

                return {
                    ...product.toJSON(),
                    minPriceColor: minPriceColor.price,
                    // isFavorite: favorites.includes(product._id.toString()),
                };
            })
        );

        const brands = await Product.distinct("brand");
        res.json({
            products: plainProducts,
            brands,
            totalPages,
            search,
            pagination,
        });
    } catch (error) {
        console.log(error.message);
        res.status(500).json({message: error.message});
    }
};

const getDetailProduct = async (req, res) => {
    try {
        const id = req.params.id;
        const product = await Product.findById(id);
        product.description.replace(/\n/g, "<br>");
        const minPriceColor = product.capacities.reduce((minColor, capacity) => {
            const minCapacityColor = capacity.colors.reduce((min, color) => {
                return color.price < min.price ? color : min;
            }, capacity.colors[0]); // Khởi tạo giá trị ban đầu là phần tử đầu tiên của mảng colors
            return minCapacityColor.price < minColor.price
                ? minCapacityColor
                : minColor;
        }, product.capacities[0].colors[0]);

        const minPriceCapacity = product.capacities.reduce(
            (minCapacity, capacity) => {
                const minCapacityColor = capacity.colors.reduce((min, color) => {
                    return color.price < min.price ? color : min;
                }, capacity.colors[0]); // Initialize with the first color of the current capacity

                if (minCapacityColor.price < minCapacity.color.price) {
                    return {color: minCapacityColor, capacity: capacity}; // Return the current capacity and its cheapest color
                } else {
                    return minCapacity; // Otherwise, return the cheapest found so far
                }
            },
            {
                color: product.capacities[0].colors[0],
                capacity: product.capacities[0],
            }
        );

        const capacitiesWithMinPrice = product.capacities.map((capacity) => {
            const minPriceColor = capacity.colors.reduce((min, color) => {
                return color.price < min.price ? color : min;
            }, capacity.colors[0]); // Initialize with the first color of the current capacity

            return {...capacity._doc, minPriceColor}; // Return the current capacity and its cheapest color
        });

        const capacitiesWithColors = product.capacities.map((capacity) => {
            const colorsWithPrice = capacity.colors.map((color) => {
                return {
                    color: color.color,
                    price: color.price,
                };
            });
            return {
                capacity: capacity.capacity,
                colorsWithPrice: colorsWithPrice,
            };
        });

        res.json({
            product: product,
            minPriceColor: minPriceColor,
            minPriceCapacity: minPriceCapacity,
            capacitiesWithMinPrice: capacitiesWithMinPrice,
            capacitiesWithColors: capacitiesWithColors,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({message: err.message});
    }
};

const getColorPriceWithCapacity = async (req, res) => {
    try {
        const productId = req.body.productId; // Lấy productId từ request parameter
        const capacity = req.body.capacity; // Lấy dung lượng từ query parameter
        // Kiểm tra xem productId và capacity có tồn tại không
        if (!productId || !capacity) {
            return res.status(400).json({message: "Missing productId or capacity"});
        }

        // Tìm sản phẩm trong cơ sở dữ liệu bằng productId
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({message: "Product not found"});
        }

        // Tìm dung lượng (capacity) tương ứng trong mảng capacities của sản phẩm
        const targetCapacity = product.capacities.find(
            (item) => item.capacity === capacity
        );
        if (!targetCapacity) {
            return res.status(404).json({message: "Capacity not found"});
        }
        const colorsWithPrice = targetCapacity.colors.map((color) => ({
            color: color.color,
            price: color.price,
            quantityInStock: color.quantityInStock,
        }));
        res.status(200).json({colorsWithPrice});
    } catch (error) {
        // Xử lý lỗi nếu có
        console.error("Error in getColorPriceWithCapacity:", error);
        res.status(500).json({message: "Internal server error"});
    }
};

const updateProductStock = async (req, res) => {
    const products = req.body.products || req.query.products;
    console.log("ZZ: ", products);
    let productsArray = [];
    let allProducts = [];
    for (const product of products) {
        const productToUpdate = await Product.findOne({
            _id: product.product_id,
            "capacities.capacity": product.capacity,
            "capacities.colors.color": product.color,
        });
        if (!productToUpdate) {
            throw new Error("Product not found");
        }

        const capacityToUpdate = productToUpdate.capacities.find(
            (capacity) => capacity.capacity === product.capacity
        );
        const colorToUpdate = capacityToUpdate.colors.find(
            (color) => color.color === product.color
        );

        let productMap = {};

        for (let i = 0; i < product.quantity; i++) {
            const randomIndex = Math.floor(
                Math.random() * colorToUpdate.serialNumbers.length
            );

            // Create a key based on the product's attributes
            const productKey = `${product.capacity}-${product.color}`;

            if (!productMap[productKey]) {
                productMap[productKey] = {
                    capacity: product.capacity,
                    color: product.color,
                    serialNumbers: [],
                };
            }

            // Add the serial number to this product's array of serial numbers
            productMap[productKey].serialNumbers.push(
                colorToUpdate.serialNumbers[randomIndex]
            );

            colorToUpdate.serialNumbers.splice(randomIndex, 1);
        }

        productsArray = Object.values(productMap);
        allProducts.push(...productsArray);

        // Decrease the quantity in stock
        colorToUpdate.quantityInStock -= product.quantity;
        // Save the product
        await productToUpdate.save();

        const productsWithSerialNumbers = products.map((product, index) => ({
            ...product,
            product_name:
                product.product_name +
                " (" +
                allProducts[index].serialNumbers.join(", ") +
                ")",
        }));

        res.json({productsWithSerialNumbers});
    }
};

const getProductWithOutId = async (req, res) => {
    try {
        const products = await Product.find({}).exec();
        res.json(products);
    } catch (error) {
        console.error(error);
        res.status(500).json({message: error.message});
    }
};
const getAllProducts = async () => {
    try {
        const products = await Product.find().exec();
        const plainProducts = products.map((product) => ({
            ...product.toJSON(),
            created: moment(product.created).format("DD/MM/YYYY HH:mm:ss"),
            retailPriceFormatted: new Intl.NumberFormat("vi-VN").format(
                product.retailPrice
            ),
        }));
        return plainProducts;
    } catch (err) {
        throw err;
    }
};

const getProductByBarCodeButDataIsNumber = async (req, res) => {
    try {
        const barcode = req.query.barcode;
        const product = await Product.find(
            {
                barcodeUPC: {
                    $regex: new RegExp(barcode, "i")
                }
            }
            ).exec();
        if (product) {
            res.json(product);
        } else {
            return res.json({});
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: e.message});
    }
}

const getProductByBarCodeButDataIsString = async (req, res) => {
    try {
        const barcode = req.query.barcode;
        const product = await Product.find(
            {
                name: {
                    $regex: new RegExp(barcode, "i")
                }
            }
        ).exec();
        if (product) {
            res.json(product);
        } else {
            return res.json({});
        }
    } catch (e) {
        console.log(e);
        return res.status(500).json({message: e.message});
    }
}

const getProductByQuery = async (req, res) => {
    try {
        const query = req.query.category;
        console.log(query)
        const products = await Product.find(
            { category: query }
        ).exec();
        if (products) {
            res.json(products);
        } else {
            return res.json({});
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({message: error.message});
    }

}

const updateProductWhenOrder = async (req, res) => {
    try {
        const id = req.params.id;
        const capacityQuery = req.query.capacity;
        const colorQuery = req.query.color;
        const quantityQuery = req.query.quantity;
        const productToUpdate = await Product.findOne({
            _id: id,
            "capacities.capacity": capacityQuery,
            "capacities.colors.color": colorQuery,
        });

        if (!productToUpdate) {
            throw new Error("Product not found");
        }

        const capacityToUpdate = productToUpdate.capacities.find(
            (capacity) => capacity.capacity === capacityQuery
        );
        console.log(capacityToUpdate)
        const colorToUpdate = capacityToUpdate.colors.find(
            (color) => color.color === colorQuery
        );

        if (
            !colorToUpdate ||
            !colorToUpdate.serialNumbers ||
            colorToUpdate.serialNumbers.length < quantityQuery // Check if enough serial numbers are available
        ) {
            throw new Error("Not enough serial numbers available");
        }

        let productMap = {};

        for (let i = 0; i < quantityQuery; i++) {
            const randomIndex = Math.floor(
                Math.random() * colorToUpdate.serialNumbers.length
            );

            // Create a key based on the product's attributes
            const productKey = `${capacityQuery}-${colorQuery}`;

            // If this product isn't in the map yet, add it
            if (!productMap[productKey]) {
                productMap[productKey] = {
                    capacity: capacityQuery,
                    color: colorQuery,
                    serialNumbers: [],
                };
            }

            // Add the serial number to this product's array of serial numbers
            productMap[productKey].serialNumbers.push(
                colorToUpdate.serialNumbers[randomIndex]
            );

            colorToUpdate.serialNumbers.splice(randomIndex, 1);
        }

        // Decrease the quantity in stock
        colorToUpdate.quantityInStock -= quantityQuery;
        // Save the product
        await productToUpdate.save();
        return res.status(200).json({
            productMap: productMap
        });
    } catch (e) {
        console.log(e)
        return res.status(500).json({message: e.message});
    }
}


module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getOptionProduct,
    getProductInManage,
    getProductById,
    get4RandomProducts,
    getProductInShop,
    getDetailProduct,
    getColorPriceWithCapacity,
    updateProductStock,
    getProductWithOutId,
    getAllProducts,
    getProductByBarCodeButDataIsNumber,
    getProductByBarCodeButDataIsString,
    getProductByQuery,
    updateProductWhenOrder
};
