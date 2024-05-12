import axios from "axios";
class HomeController {
    async index(req, res) {
        const reportResponse = await axios.get(" http://localhost:3003/api/report/getOrderOfDay");
        const userResponse = await axios.get("http://localhost:3002/auth/sendData");
        req.session.user = userResponse.data;
        console.log(userResponse.data)
        res.render("home", {
            name: userResponse.data.fullname,
            email:userResponse.data.email,
            role: userResponse.data.role,
            totalRevenue: reportResponse.data.totalRevenue,
            totalProductsSold: reportResponse.data.totalProductsSold,
            totalOrders: reportResponse.data.totalOrders,
        });
    }
}

export default new HomeController();