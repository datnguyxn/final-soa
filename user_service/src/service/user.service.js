import User from "../model/user.model.js";
import {ErrorMessage} from "../util/error.message.js";
import {isLockUser} from "./auth.service.js";

async function deleteAll() {
    try {
        await User.deleteMany();
        return "Delete all account successfully";
    } catch (e) {
        console.log(e)
        return ErrorMessage(500, "Server errors", e);
    }
}

async function find(data) {
    try {
        const account = await User.find({
            ...data
        }).select("-password");
        if (!account) {
            return null
        } else {
            return account;
        }
    } catch (e) {
        console.log(e)
        return ErrorMessage(500, "Server errors", e);
    }
}

async function getAll() {
    try {
        const data = await User.find()
            .select("-password")
        if (data == null) {
            return null
        }
        return data
    } catch (e) {
        console.log(e)
        return ErrorMessage(500, "Server errors", e);
    }
}

async function update(data) {
    try {
        const account = await User.findOneAndUpdate({
                _id: data._id
            },
            {
                $push: {
                    invoices: {
                        $each: [data.invoices],
                        $position: 0
                    }
                }
            })
        if (account == null) {
            return null
        } else {
            return account
        }
    } catch (e) {
        console.log(e)
        return ErrorMessage(500, "Server errors", e);
    }
}

async function lockUser(id) {
    try {
        console.log(id)
        const isLock = await isLockUser(id)
        const account = await User.findById(id);
        if (!account) {
            return null
        } else {
            if (account.role === "ADMIN") {
                return ErrorMessage(400, "Can't lock admin account")
            }
            if (isLock) {
                account.isLocked = false
                await account.save()
            } else {
                account.isLocked = true
                await account.save()
            }
        }
        return account;
    } catch (e) {
        console.log(e)
        return ErrorMessage(500, "Server errors", e);
    }
}

async function deleteOne(id) {
    try {
        const account = await User.findById(id);
        if (!account) {
            return ErrorMessage(404, "User not found")
        } else {
            await account.deleteOne();
            return "Delete account successfully";
        }
    } catch (e) {
        console.log(e)
        return ErrorMessage(500, "Server errors", e);
    }
}

export {
    deleteAll,
    deleteOne,
    update,
    lockUser,
    find,
    getAll,
};