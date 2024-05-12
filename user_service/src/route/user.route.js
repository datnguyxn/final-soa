import express from "express";

import  UserController  from "../controller/user.controller.js";

const router = express.Router();

router.delete("/delete_all", UserController.deleteAll.bind(UserController));
router.post("/find", UserController.find.bind(UserController));
router.get("/find_all", UserController.getAll.bind(UserController));
router.get("/get_staff", UserController.getStaff.bind(UserController));
router.delete("/delete/:id", UserController.deleteUser.bind(UserController));
router.put("/update/:id", UserController.updateUser.bind(UserController));
router.post("/lock/:id", UserController.lockUser.bind(UserController));
router.get("/get_one/:id", UserController.getOne.bind(UserController));
router.post("/default_password/:id", UserController.defaultPassword.bind(UserController));
router.get("/unlock/:id", UserController.unlockMember.bind(UserController));
router.get("/lock/:id", UserController.lockMember.bind(UserController));

export default router;