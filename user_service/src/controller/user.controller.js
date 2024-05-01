import {deleteAll, deleteOne, find, getAll, update, lockUser} from "../service/user.service.js";
import paginate from "../util/paginate.js";

class UserController {
    async deleteAll(req, res) {
        try {
            await deleteAll()
            return res.status(200).json({message: "Delete all account successfully"})
        } catch (e) {
            return res.status(500).json({message: e.message})
        }
    }

    async find(req, res) {
        try {
            console.log(req.body)
            const account = await find(req.body)
            if (account == null) {
                return res.status(404).json({message: "Account not found"})
            }
            return res.status(200).json(account)
        } catch (e) {
        }
    }

    async getAll(req, res) {
        try {
            const page = req.query.page || 1
            const accounts = await getAll()
            if (accounts == null) {
                return res.status(404).json({message: "No Accounts found"})
            } else {
                return paginate(accounts, page, 10)
            }
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e.message})
        }
    }
    async getOne(req, res) {
        try {
            const id = req.user.id;
            const account = await findAccount(id);
            if (account == null) {
                throw new Error("Account not found");
            }
            return account;  // Return the account data
        } catch (e) {
            console.log(e);
            throw e;  // Rethrow the error to be handled in the router
        }
    }

    async delete(req, res) {
        try {
            const account = await deleteOne(req.params.id)
            if (account == null) {
                return res.status(404).json({message: "Account not found"})
            }
            return res.status(200).json({message: account})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e.message})
        }
    }

    async update(req, res) {
        try {
            const account = await update(req.params.id, req.body)
            if (account == null) {
                return res.status(404).json({message: account})
            }
            return res.status(200).json({message: account})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e.message})
        }
    }

    async lockAccount(req, res) {
        try {
            const account = await lockUser(req.params.id)
            if (account == null) {
                return res.status(404).json({message: "Account not found"})
            }
            if (account.status === 400) {
                return res.status(400).json({message: account.message})
            }
            return res.status(200).json({message: account})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e.message})
        }
    }
}

export default new UserController();