import axios from "axios";

const getCategories = async (req, res) => {
    try {
        const {
            role, fullname, avt
        } = req.session.user;
        const categoryResponse = await axios.get("http://localhost:3456/api/category");
        let categories = categoryResponse.data.categories;
        categories = categories.map(category => {
            return {
                ...category,
                role
            }
        });
        res.render("category", {
            role,
            fullname,
            avt,
            categories: categories,
        });
    } catch (error) {
        console.log(error);
        res.render("category", {
            role: "",
            fullname: "",
            avt: "",
            categories: [],
        });
    }
}

const createCategory = async (req, res) => {
    try {
        const name = req.body.name;
        const categoryResponse = await axios.post("http://localhost:3456/api/category/create", {
            name
        });
        if(categoryResponse.data.success){
            req.session.message = {
                type: "success",
                message: "Category added successfully",
            };
            res.redirect("/category");
        } else {
            req.session.message = {
                type: "danger",
                message: categoryResponse.data.message,
            };
            res.redirect("/category");

        }
    } catch (error) {
        req.session.message = {
            type: "danger",
            message: error.message,
        };
    }
};

const updateCategory = async (req, res) => {
    try {
        const id = req.body.id;
        const newName = req.body.name;

        const categoryResponse = await axios.post("http://localhost:3456/api/category/edit", {
            id,
            newName
        });

        if (!categoryResponse) {
            return res.redirect("/category");
        }
        req.session.message = {
            type: "success",
            message: "Category edited successfully",
        };
        res.redirect("/category"); // Redirect to the category page after successful update
    } catch (err) {
        console.error(err);
        req.session.message = {
            type: "danger",
            message: err.message,
        };
        res.redirect("/category");
    }
};

const deleteCategory = async (req, res) => {
    try {
        const id = req.params.id;
        const categoryResponse = await axios.delete("http://localhost:3456/api/category/delete/" + id);
        if (!categoryResponse) {
            return res.redirect("/category");
        }
        res.json({ success: true, message: 'Category deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: 'Error deleting category' });
    }
};

export {
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
}