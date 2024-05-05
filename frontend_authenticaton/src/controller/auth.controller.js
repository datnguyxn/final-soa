import axios from "axios";

const login = async (req, res) => {
    const { username, password } = req.body;
    await axios.post('http://localhost:3000/api/v1/auth/login', {
        username: username,
        password: password
    }).then((response) => {
        if (response.data.role === "ADMIN") {
            res.redirect("");
        } else if (response.data.role === "STAFF") {
            res.redirect("");
        } else if (response.data.role === "MANAGER") {
            res.redirect("");
        }
    }).catch((error) => {
        res.redirect("/")
    });
}

export {
    login
}