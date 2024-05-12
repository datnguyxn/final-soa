import axios from "axios";

const getReport = async (req, res) => {
    try {
        const {
            role, fullname, avt
        } = req.session.user;
        const reportResponse = await axios.get("http://localhost:3003/api/report");

        res.render("report", {
            role,
            fullname,
            avt,
            count_order: reportResponse.data.count_order,
            count_customer: reportResponse.data.count_customer,
            count_product: reportResponse.data.count_product,
            total_money: reportResponse.data.total_money,
            name_product: reportResponse.data.name_product
        });
    } catch (error) {
        console.log(error);
        res.render("report", {
            role: "",
            fullname: "",
            avt: "",
            count_order: "",
            count_customer: "",
            count_product: "",
            total_money: "",
            name_product: "",
        });
    }
}

const reportDetail = async (req, res) => {
    try {
        const {
            select,
            input,
            output,
            order_type
        } = req.body;
        const {
            role, fullname, avt
        } = req.session.user;
        const reportResponse = await axios.post("http://localhost:3003/api/report/reportDetail", {
            select,
            input,
            output,
            order_type
        });
        console.log(reportResponse.data)
        res.render("reportDetail", {
            date: reportResponse.data.date,
            input: reportResponse.data.input,
            output: reportResponse.data.output,
            order: reportResponse.data.order,
            total: reportResponse.data.total,
            detailOrderInDay: reportResponse.data.detailOrderInDay,
            fullname,
            role,
            avt
        });
    } catch (e) {
        console.log(e)
        res.status(500).json({message: e.message});
    }
}

const getOrderOfWeek = async (req, res) => {
    try {
        const reportResponse = await axios.get('http://localhost:3003/api/report/getOrderOfWeek');
        if (reportResponse) {
            return res.status(200).json(reportResponse.data);
        } else {
            return res.status(404).json("Not found");
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json(e);
    }
}

const getAmountOfWeek = async (req, res) => {
    try {
        const reportResponse = await axios.get('http://localhost:3003/api/report/getAmountOfWeek');
        if (reportResponse) {
            return res.status(200).json(reportResponse.data);
        } else {
            return res.status(404).json("Not found");
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json(e);
    }
}

export {
    getReport,
    reportDetail,
    getOrderOfWeek,
    getAmountOfWeek
}