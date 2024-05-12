import {deleteAll, deleteOne, find, getAll, lockUser, updateUser} from "../service/user.service.js";
import User from "../model/user.model.js";
import moment from "moment";
import bcrypt from "bcrypt";

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

    async getOne(req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (user == null) {
                return res.status(404).json({message: "User not found"});
            }
            return res.status(200).json(user);
        } catch (e) {
            console.log(e);
            return res.status(500).json({message: e.message});
        }
    }

    async getAll(req, res) {
        try {
            const page = req.query.page || 1
            const users = await getAll()
            if (users == null) {
                return res.status(404).json({message: "No Users found"})
            } else {
                return res.status(200).json({
                    users: users,
                    page: page,
                    total: users.length
                })
            }
        } catch (e) {
            console.log(e)
            return res.status(500).json({message: e.message})
        }
    }

    async deleteUser(req, res) {
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

    async updateUser(req, res) {
        try {
            const data = {
                _id: req.params.id,
                username: req.body.username,
                fullname: req.body.fullname,
                email: req.body.email
            }
            console.log(data)
            const user = await updateUser(data)
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

    async getStaff(req, res) {
        try {
            let {page, pageSize, search} = req.query;

            // Set default values if not provided
            page = page ? parseInt(page, 10) : 1;
            pageSize = pageSize ? parseInt(pageSize, 10) : 10;

            // Create a MongoDB query object based on search criteria
            const query = {
                role: {$ne: "ADMIN"}, // Exclude users with the role 'admin'
            };
            if (search) {
                query.username = {$regex: new RegExp(search, "i")}; // Case-insensitive search on the 'name' field
            }

            // Fetch staff members with pagination and search
            const staffs = await User.find(query)
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .exec();

            const totalStaffs = await User.countDocuments(query);

            const totalPages = Math.ceil(totalStaffs / pageSize);

            const pagination = {
                pages: Array.from({length: totalPages}, (_, i) => ({
                    page: i + 1,
                    isCurrent: i + 1 === page,
                })),
                pageSize,
                currentPage: page,
                totalStaffs,
            };

            // Include information about the previous and next pages
            if (page > 1) {
                pagination.prevPage = page - 1;
            }

            if (page < totalPages) {
                pagination.nextPage = page + 1;
            }

            const plainStaffs = staffs.map((staff) => ({
                ...staff.toJSON(),
                created: moment(staff.created).format("DD/MM/YYYY HH:mm:ss"),
            }));
            return res.status(200).json(
                {
                    plainStaffs,
                    totalPages,
                    search,
                    pagination
                })
        } catch (err) {
            res.status(500).json({message: err.message});
        }
    };

    async defaultPassword(req, res) {
        try {
            const id = req.params.id;
            const user = await User.findOne({_id: id});
            const defaultPassword = user.email.split("@")[0];
            const hashedPassword = await bcrypt.hash(defaultPassword, 10);
            const updatedUser = await User.findOneAndUpdate(
                {_id: id},
                {password: hashedPassword},
                {new: true}
            );
            if (!updatedUser) {
                return res.status(404).json({message: "User not found"});
            }
            return res.status(200).json({message: "Password reset successfully"});
        } catch (err) {
            console.error(err);
            return res.status(500).json({message: err.message});
        }
    };

    lockMember = async (req, res) => {
        try {
            const id = req.params.id;

            const lockMember = await User.findByIdAndUpdate(
                id,
                {
                    isLocked: true,
                },
                {new: true}
            ).exec();
            res.status(200).json({message: "This account has been locked"});
        } catch (err) {
            console.error(err);
            res.status(500).json({message: err.message});
        }
    };
    unlockMember = async (req, res) => {
        try {
            const id = req.params.id;

            const lockMember = await User.findByIdAndUpdate(
                id,
                {
                    isLocked: false,
                },
                {new: true}
            ).exec();

            res.status(200).json({message: "This account has been unlocked"});
        } catch (err) {
            console.error(err);
            res.status(500).json({message: err.message});
        }
    };
}

export default new UserController();