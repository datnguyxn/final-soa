import axios from "axios";

let data;
const login = async (req, res) => {
    const { username, password } = req.body;
    await axios.post('http://localhost:3000/api/v1/auth/login', {
        username: username,
        password: password
    }).then((response) => {
        data = response.data;
        if (response.data.role === "ADMIN") {
            res.redirect("http://localhost:3004/");
        } else if (response.data.role === "STAFF") {
            res.redirect("http://localhost:3004/");
        } else if (response.data.role === "MANAGER") {
            res.redirect("http://localhost:3455/product");
        }
    }).catch((error) => {
        res.redirect("/")
    });
}

const sendData = async (req, res) => {
   if (data) {
       res.status(200).json(data);
   } else {
       res.status(500).send({});
   }
}

export {
    login,
    sendData
}