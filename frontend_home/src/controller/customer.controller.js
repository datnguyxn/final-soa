import axios from "axios";

const getCustomer = async (req, res) => {
    try {
        const {
            role, fullname, avt
        } = req.session.user;
        const customerResponse = await axios.get("http://localhost:3457/api/customer-info/get-customers/", {params: req.query});
        let customers = customerResponse.data.customers;
        customers = customers.map(customer => {
            return {
                ...customer,
                role
            }
        });
        const pagination = customerResponse.data.pagination;
        const search = customerResponse.data.search;
        const totalPage = customerResponse.data.totalPages;
        res.render("customer", {
            customers: customers,
            role,
            fullname,
            avt,
            pagination,
            search,
            totalPage
        });
    } catch (error) {
        console.log(error);
        res.render("customer", {
            customers: [],
        });
    }
}

const getCustomerById = async (req, res) => {
    try {
        const {
            role, fullname, avt
        } = req.session.user;
        const name = req.query.name;
        const customerResponse = await axios.get("http://localhost:3457/api/customer-info/customer-detail?name=" + name);
        const customer = customerResponse.data;
        console.log(customer)
        res.render("customerDetail", {
            order: customer.detail,
            name: customer.name,
            role,
            fullname,
            avt,
            _name: customer._name
        });
    } catch (e) {
        console.log(e)
    }
}

const getEditCustomer = async (req, res) => {
    try {
        const {
            role, fullname, avt
        } = req.session.user;
        const id = req.params.id;
        const customerResponse = await axios.get("http://localhost:3457/api/customer-info/get-customer-by-id", {params: {customer_id: id}});
        const customer = customerResponse.data;
        console.log(customer)
        if (!customer) {
            return res.redirect("/customer");
        }
        res.render("editCustomer", {
            customer,
            role,
            fullname,
            avt
        });
    } catch (e) {
        console.log(e)
        res.redirect("/customer");
    }
}

const updateCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        const {
            nameCt,
            phone,
            address
        } = req.body;
        const response = await axios.post("http://localhost:3457/api/customer-info/update-customer/" + id, {
            nameCt,
            phone,
            address
        });
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        console.log(response.data)
        req.session.message = {
            type: "success",
            message: "Customer updated successfully",
        };
        res.redirect("/customer");
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: e.message,
        };
        res.redirect("/customer");
    }
}

const deleteCustomer = async (req, res) => {
    try {
        const id = req.params.id;
        const response = await axios.get("http://localhost:3457/api/customer-info/delete-customer/" + id);
        if (!response.data.success) {
            throw new Error(response.data.message);
        }
        req.session.message = {
            type: "success",
            message: "Customer deleted successfully",
        };
        res.redirect("/customer");
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: e.message,
        };
        res.redirect("/customer");
    }

}

export {
    getCustomer,
    getCustomerById,
    getEditCustomer,
    updateCustomer,
    deleteCustomer
}