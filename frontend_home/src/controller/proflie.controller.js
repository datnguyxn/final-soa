import axios from "axios";

const index = async (req, res) => {
    const {
        _id,
        email,
        fullname,
        role,
        username
    } = req.session.user;
    res.render("profile", {
        _id,
        username,
        email,
        fullname,
        role,
    });
}

const getEditProfile = async (req, res) => {
    const {
        _id,
        email,
        fullname,
        role,
        username
    } = req.session.user;
    const profile = {
        _id,
        email,
        fullname,
        role,
        username
    }
    res.render("editProfile", {
        profile: profile,
        _id,
        role,
        fullname
    });
}

const updateProfile = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(req.body)

        const staffResponse = await axios.put("http://localhost:3000/api/user/update/" + id, {
            username: req.body.username,
            fullname: req.body.fullname,
            email: req.body.email,

        });
        if (staffResponse.data) {
            req.session.message = {
                type: "success",
                message: "Profile updated successfully",
            };
            req.session.user = staffResponse.data;
            console.log(staffResponse.data)
            res.redirect("/staff");
        }
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: e.message,
        };
        res.redirect("/");
    }
}

const getChangePassword = async (req, res) => {
    const id = req.session.user._id;
    res.render("ChangePW", {
        id
    });
}

const changePassword = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id)
        console.log(req.body)

        const staffResponse = await axios.post("http://localhost:3000/api/v1/auth/change_password/", {
            id: id,
            oldPassword: req.body.oldPassword,
            newPassword: req.body.newPassword,
            confirmPassword: req.body.confirmPassword,
        });
        if (staffResponse.data) {
            req.session.message = {
                type: "success",
                message: "Password updated successfully",
            };
            req.session.user = staffResponse.data;
            console.log(staffResponse.data)
            res.redirect("/");
        }
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: e.message,
        };
        res.redirect("/");
    }
}

export {
    index,
    getEditProfile,
    updateProfile,
    getChangePassword,
    changePassword
}