const axios = require("axios");
const getPage = (req, res) => {
  res.render("auth_page");
};

const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const response = await axios.post("http://localhost:3457/auth/login", {
      username,
      password,
    });
    if(response.status === 201){
      const existingCustomer = response.data.existingCustomer;
      req.session.customer = {
        username: existingCustomer.username,
        email: existingCustomer.email,
        _id: existingCustomer._id,
        phone: existingCustomer.phone,
        address: existingCustomer.address,
        gender: existingCustomer.gender,
        name: existingCustomer.name,
      };
      res.redirect("/index");
    } else if (response.status === 202) {
      req.session.message = {
        type: "danger",
        message: "Sai tên đăng nhập hoặc mật khẩu",
      };
      res.redirect("/auth");
    } else {
      req.session.message = {
        type: "danger",
        message: "Tài khoản chưa được kích hoạt",
      };
      res.redirect("/auth");
    }
  } catch (error) {
    res.status(error.response.status).json(error.response.data);
  }
}

const signup = async (req, res) => {
  const response = await axios.post("http://localhost:3457/auth/signup", req.body);
  if(response.status == 200) {
    req.session.message = {
      type: "danger",
      message: "Mật khẩu không khớp",
    };
    res.redirect("/auth");
  } else if(response.status == 201) {
    req.session.message = {
      type: "danger",
      message: "Email đã tồn tại",
    };
    res.redirect("/auth");
  } else {
    req.session.message = {
      type: "success",
      message: "Hãy kiểm tra email để kích hoạt tài khoản",
    };
    res.redirect("/auth");
  }

}
module.exports = { getPage, login, signup};
