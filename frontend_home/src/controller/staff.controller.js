import axios from "axios";

const isAdmin = (req, res, next) => {
    if (req.session.user.role === "ADMIN") {
        next();
    } else {
        res.redirect("/");
    }
};

const staffPage = async (req, res) => {
    try {
        const {
            role, fullname, avt
        } = req.session.user;
        const staffResponse = await axios.get("http://localhost:3000/api/user/get_staff/", {params: req.query});
        res.render("staff", {
            role,
            fullname,
            avt,
            staffs: staffResponse.data.plainStaffs,
            pagination: staffResponse.data.pagination,
            totalPage: staffResponse.data.totalPages,
            search: staffResponse.data.search
        });
    } catch (error) {
        console.log(error);
        res.render("staff", {
            role: "",
            fullname: "",
            avt: ""
        });
    }
};

const getEditStaff = async (req, res) => {
    try {
        const id = req.params.id;
        const staffResponse = await axios.get("http://localhost:3000/api/user/get_one/" + id);
        const staff = staffResponse.data;
        res.render("editStaff", {staff});
    } catch (e) {
        console.log(e)
    }
}

const updateStaff = async (req, res) => {
    try {
        const id = req.params.id;

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

const createStaff = async (req, res) => {
    try {
        const {
            fullname,
            email
        } = req.body;
        const newStaffResponse = await axios.post("http://localhost:3000/api/v1/auth/register", {
            fullname,
            email
        });
        if (newStaffResponse.data) {
            req.session.message = {
                type: "success",
                message: "Staff created successfully",
            };
            res.redirect("/staff");
        } else {
            req.session.message = {
                type: "danger",
                message: "Staff created failed",
            };
            res.redirect("/staff");

        }
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: "Staff created failed",
        };
        res.redirect("/staff");
    }
}

const defaultPassword = async (req, res) => {
    try {
        const id = req.params.id;
        const defaultPasswordResponse = await axios.post("http://localhost:3000/api/user/default_password/" + id);
        if (defaultPasswordResponse.data) {
            req.session.message = {
                type: "success",
                message: "Password reset successfully",
            };
            res.redirect("/staff");
        }
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: e.message,
        };
        res.redirect("/staff");
    }
}

const resendMail = async (req, res) => {
    try {
        const email = req.body.email;
        const resendMailResponse = await axios.post("http://localhost:3000/api/v1/auth/resend_mail/", {
            email
        });
        if (resendMailResponse.data) {
            req.session.message = {
                type: "success",
                message: "Mail resent successfully",
            };
            res.redirect("/staff");
        }
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: e.message,
        };
        res.redirect("/staff");
    }
}

const deleteStaff = async (req, res) => {
    try {
        const id = req.params.id;
        const deleteStaffResponse = await axios.delete("http://localhost:3000/api/user/delete/" + id);
        if (deleteStaffResponse.data) {
            req.session.message = {
                type: "success",
                message: "Staff deleted successfully",
            };
            res.redirect("/staff");
        }
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: e.message,
        };
        res.redirect("/staff");
    }
}

const unlockStaff = async (req, res) => {
    try {
        const id = req.params.id;
        const unlockStaffResponse = await axios.get("http://localhost:3000/api/user/unlock/" + id);
        if (unlockStaffResponse.data) {
            req.session.message = {
                type: "success",
                message: "Staff unlocked successfully",
            };
            res.redirect("/staff");
        }
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: e.message,
        };
        res.redirect("/staff");
    }
}

const lockStaff = async (req, res) => {
    try {
        const id = req.params.id;
        const lockStaffResponse = await axios.get("http://localhost:3000/api/user/lock/" + id);
        if (lockStaffResponse.data) {
            req.session.message = {
                type: "success",
                message: "Staff locked successfully",
            };
            res.redirect("/staff");
        }
    } catch (e) {
        console.log(e)
        req.session.message = {
            type: "danger",
            message: e.message,
        };
        res.redirect("/staff");
    }
}

export {
    isAdmin,
    staffPage,
    getEditStaff,
    updateStaff,
    createStaff,
    defaultPassword,
    resendMail,
    deleteStaff,
    unlockStaff,
    lockStaff
}