import {deleteAll, deleteOne, find, getAll, update, lockUser} from "../service/user.service.js";
import paginate from "../util/paginate.js";

class UserController {
    async deleteAll(req, res) {
        try {
            await deleteAll()
            return res.status(200).json({message: "Delete all user successfully"})
        } catch (e) {
            return res.status(500).json({message: e.message})
        }
    }

    async find(req, res) {
        try {
            console.log(req.body)
            const user = await find(req.body)
            if (user == null) {
                return res.status(404).json({message: "User not found"})
            }
            return res.status(200).json(user)
        } catch (e) {
        }
    }

    async getAll(req, res) {
        try {
            const page = req.query.page || 1
            const users = await getAll()
            if (users == null) {
                return res.status(404).json({message: "No Users found"})
            } else {
                return res.status(200).json(paginate(users, page, 10))
            }
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e.message})
        }
    }

    async delete(req, res) {
        try {
            const user = await deleteOne(req.params.id)
            if (user == null) {
                return res.status(404).json({message: "User not found"})
            }
            return res.status(200).json({message: user})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e.message})
        }
    }

    async update(req, res) {
        try {
            const user = await update(req.params.id, req.body)
            if (user == null) {
                return res.status(404).json({message: user})
            }
            return res.status(200).json({message: user})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e.message})
        }
    }

    async lockUser(req, res) {
        try {
            const user = await lockUser(req.params.id)
            if (user == null) {
                return res.status(404).json({message: "User not found"})
            }
            if (user.status === 400) {
                return res.status(400).json({message: user.message})
            }
            return res.status(200).json({message: user})
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e.message})
        }
    }
}

export default new UserController();