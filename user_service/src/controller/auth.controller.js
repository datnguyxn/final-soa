import axios from "axios";
import {authenticate, createUser, setActive, resetPassword, changePassword} from "../service/auth.service.js";
import variables from "../config/variables.js";
import {generateTokenForActive, verifyToken} from "../util/verify.token.js";
import User from "../model/user.model.js";
class AuthController {
    async authenticate(req, res) {
        const data = req.body;
        const user = await authenticate(data);
        switch (user.status) {
            case 400: {
                return res.status(400).json({error: user.message});
            }
            case 500: {
                return res.status(500).json({error: "Server error"});
            }
            default: {
                req.session.users = req.session?.users || [];
                //     check if user already exist in session
                const account = req.session.users.find(user => user._id === user._id);
                if (!account) {
                    req.session.users.push({
                        _id: user._id,
                        fullname: user.fullname,
                        email: user.email,
                        role: user.role,
                        token: user.token,
                        refreshToken: user.refreshToken
                    });
                }
                req.session.save();

                res.cookie("refreshToken", user.refreshToken, {
                    httpOnly: true,
                    secure: true,
                    path: "/",
                    sameSite: "strict"
                })
                return res.status(200).json(user);
            }
        }
    }

    async create(req, res) {

        const user = await createUser(req.body);
        if (user == null) {
            return res.status(400).send({error: "User already exist"});
        }
        const data = {
            email: user.email,
            subject: "Active your account",
            template: "verify-user",
            context: {
                name: user.fullname,
                email: user.email,
                url: `${variables.URL}:${variables.PORT}/api/v1/auth/validate/${await generateTokenForActive(user)}?email=${user.email}&success_redirect=auth/change_password/${user._id}&failure_redirect=auth/failed_active&token=${user.token}`,
            }
        }


        try {
            const emailResponse = await axios.post("http://localhost:3001/api/email/send_email", {
                email: data.email,
                subject: data.subject,
                template: data.template,
                context: data.context
            });
            if (emailResponse.status !== 200) {
                return res.status(500).json({errors: "Server errors"});
            } else {
                return res.status(200).json(user);
            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({errors: "Server errors"});
        }
    }

    async resendMail(req, res) {
        const user = await User.findOne({email: req.body.email});
        try {
            const data = {
                email: user.email,
                subject: "Reactive your account",
                template: "verify-user",
                context: {
                    name: user.fullname,
                    email: user.email,
                    url: `${variables.URL}:${variables.PORT}/api/v1/auth/validate/${await generateTokenForActive(user)}?email=${user.email}&success_redirect=auth/change_password/${user._id}&failure_redirect=auth/failed_active&token=${user.token}`,
                }
            }
            const emailResponse = await axios.post("http://localhost:3001/api/email/send_email", {
                email: data.email,
                subject: data.subject,
                template: data.template,
                context: data.context
            });
            if (emailResponse.status !== 200) {
                return res.status(500).json({errors: "Server errors"});
            } else {
                return res.status(200).json({message: "Send mail success"});
            }
        } catch (e) {
            console.log(e);
            return res.status(500).json({errors: "Server errors"});
        }
    }

    async validate(req, res) {
        const {token} = req.params;
        const decodeToken = await verifyToken(token).then((data) => data).catch((e) => null);
        // Check if the token exists and is still valid.
        if (decodeToken && decodeToken.exp > Date.now() / 1000) {
            console.log('Valid token.');
            const account = await setActive(req.query.email);
            if (account == null) {
                return res.status(400).json({errors: "User not found"});
            }
            return res.status(200).json({message: "Active success"});
        } else {
            res.clearCookie("refreshToken");
            res.clearCookie("role");
            console.log('Invalid token.');
            return res.status(400).json({errors: "Invalid token"});
        }
    }

    async resetPassword(req, res) {
        console.log(req.params.id, req.body)
        const account = await  resetPassword(req.params.id, req.body);
        if (account == null) {
            return res.status(400).json({errors: "Account not found"});
        }
        if (account.message) {
            return res.status(account.status).json({errors: account.message});
        }
        return res.status(200).json(account);
    }

    async changePassword(req, res) {
        try {
            const data = {
                id: req.user.id,
                oldPassword: req.body.oldPassword,
                newPassword: req.body.newPassword,
                confirmPassword: req.body.confirmPassword
            }
            const account = await changePassword(data);
            if (account == null) {
                return res.status(400).json({errors: "Account not found"});
            }
            if (account.message) {
                return res.status(account.status).json({errors: account.message});
            }
            return res.status(200).json(account);
        } catch (e) {
            console.log(e)
            return res.status(500).json({errors: "Server errors"});
        }
    }
}

export default new AuthController();