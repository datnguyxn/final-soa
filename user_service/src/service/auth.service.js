import User from "../model/user.model.js";
import bcrypt from "bcrypt";
import { ErrorMessage } from "../util/error.message.js";
import { generateToken, verifyToken, generateRefreshToken, verifyRefreshToken } from "../util/verify.token.js";
export const verifyUser = async (data) => {
    try {
        const existUser = await User.findOne({
            username: data.username
        });

        if (!existUser) {
            // status for exist data
            return ErrorMessage(400, "User not found");
        }

        if (!existUser.active) {
            return ErrorMessage(400, "Please login by clicking on the link in your email");
        }

        if (existUser.isLocked) {
            return ErrorMessage(400, "User is locked");
        }

        const isMatch = await bcrypt.compare(data.password.trim(), existUser.password.trim());
        if (!isMatch) {
            return ErrorMessage(400, "Invalid credentials");
        }

        const token = existUser.token;

        const decodedToken = await verifyToken(token).then((data) => data).catch((e) => null)
        console.log("decodedToken", decodedToken)
        //     check if token is not expired then return it token or else check if refresh token is not expired then return new token
        if (decodedToken && decodedToken.exp > Date.now() / 1000) {
            console.log("token is not expired");
            return existUser;
        } else {
            console.log("token is expired");
            const newRefreshToken = await generateRefreshToken({
                id: existUser._id,
                username: existUser.username,
                role: existUser.role
            });
            const decodedRefreshToken = await verifyRefreshToken(newRefreshToken);
            console.log("decodedRefreshToken", decodedRefreshToken)
            if (!decodedRefreshToken) {
                return ErrorMessage(400, "Invalid refresh token");
            }

            if (decodedRefreshToken.exp > Date.now() / 1000) {
                console.log("refresh token is not expired and generate new token");
                const newToken = await generateToken({
                    id: existUser._id,
                    username: existUser.username,
                    role: existUser.role
                });
                const newRefreshToken = await generateRefreshToken({
                    id: existUser._id,
                    username: existUser.username,
                    role: existUser.role
                });
                existUser.refreshToken = newRefreshToken;
                existUser.token = newToken;
                await existUser.save();
                return existUser;
            } else {
                return ErrorMessage(400, "Refresh token expired");
            }
        }
    } catch (e) {
        console.log(e);
        return ErrorMessage(500, "Server errors", e);
    }
}

export const findUser = async (id) => {
    try {
        const existUser = await User.findOne({
            _id: id
        });

        if (!existUser) {
            // status for exist data
            return ErrorMessage(400, "User not found");
        }

        return existUser;
    } catch (e) {
        console.log(e);
        return ErrorMessage(500, "Server errors", e);
    }
}

export const isLockUser = async (id) => {
    try {
        const existUser = await User.findOne({
            _id: id
        });

        if (!existUser) {
            // status for exist data
            return false
        }

        if (existUser.isLocked) {
            return true;
        }
    } catch (e) {
        console.log(e);
        return ErrorMessage(500, "Server errors", e);
    }
}


async function createUser(data) {
    try {
        const existUser = await User.findOne({
            email: data.email
        })
        if (existUser) {
            return null;
        }
        console.log(data)
        const username = data?.email.split("@")[0];
        const defaultPassword = username;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPassword, salt);
        const token =await generateToken({
            username,
            role: "STAFF"
        });
        const refreshToken =await generateRefreshToken({
            username,
            role: "STAFF"
        });
        const newUser = new User({
            ...data,
            username: username,
            password: hashedPassword,
            token: token,
            refreshToken: refreshToken
        });
        await newUser.save();
        return {
            ...newUser._doc,
            password: undefined
        }
    } catch (error) {
        throw new ErrorMessage(error.message);
    }
}

async function authenticate(data) {
    console.log(data)
    return new Promise(async (resolve, reject) => {
        const isOk = await verifyUser(data);
        if (!isOk) {
            return reject(isOk);
        }

        return resolve(isOk);
    })
}
async function setActive(email) {
    try {
        const account = await User.findOne({email: email});
        if (!account) {
            return null;
        } else {
            account.active = true;
            await account.save();
            return account;
        }
    } catch (e) {
        console.log(e)
        return ErrorMessage(500, "Server errors", e);
    }
}

async function resetPassword(id, data) {
    try {
        const account = await User.findById(id);
        if (!account) {
            return null;
        }
        const isMatch = await bcrypt.compare(account.password, data.newPassword);
        if (isMatch) {
            return ErrorMessage(400, "New password must be different from old password");
        } else {
            console.log(data.newPassword)
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(data.newPassword, salt);
            account.password = hashedPassword;
            account.logging = true;
            await account.save();
            return account;
        }
    } catch (e) {
        return ErrorMessage(500, "Server errors", e);
    }
}

async function changePassword(data) {
    try {
        const account = await User.findById(data.id);
        if (!account) {
            return ErrorMessage(400, "User not found");
        }
        if (data.newPassword !== data.confirmPassword) {
            return ErrorMessage(400, "Confirm password is not match");
        }
        const isMatch1 = await bcrypt.compare(data.oldPassword, account.password);
        if (!isMatch1) {
            return ErrorMessage(400, "Current password is incorrect");
        }
        const isMatch = await bcrypt.compare(data.newPassword, account.password);
        console.log(data.oldPassword, data.newPassword)
        console.log(isMatch)
        if (isMatch) {
            return ErrorMessage(400, "New password must be different from old password");
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(data.newPassword, salt)
        const accountAfterChangePassword = await User.findByIdAndUpdate({
                _id: data.id
            },
            {
                $set: {
                    password: hashedPassword
                }
            })
        if (accountAfterChangePassword == null) {
            return null
        }
        return accountAfterChangePassword;
    } catch (e) {
        console.log(e)
        return e.message;
    }
}

export {createUser, authenticate, setActive, resetPassword, changePassword};