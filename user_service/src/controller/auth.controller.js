
import {authenticate, createUser} from "../service/auth.service.js";
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
                if (user.role === "ADMIN") {
                    return res.redirect('/admin/dashboard');
                } else {
                    return res.redirect('/');
                }
            }
        }
    }

    async create(req, res) {

        const account = await createUser(req.body);
        if (account == null) {
            return res.status(400).send({error: "User already exist"});
        }
        // await mailService.sendMail({
        //     email: account.email,
        //     subject: "Phone Store - Active account",
        //     template: "notification_new_account",
        //     context: {
        //         name: account.name,
        //         email: account.email,
        //         url: `${variables.URL}:${variables.PORT}/api/v1/auth/validate/${await genarateTokenForActive(account)}?email=${account.email}&success_redirect=auth/change_password/${account._id}&failure_redirect=auth/failed_active&token=${account.token}`,
        //     }
        // });
        return res.status(200).json(account);
    }
}

export default new AuthController();