import express from "express";

import  UserController  from "../controller/user.controller.js";

const router = express.Router();

router.delete("/delete_all", UserController.deleteAll.bind(UserController));
router.post("/find", UserController.find.bind(UserController));
router.get("/find_all", UserController.getAll.bind(UserController));
router.delete("/delete/:id", UserController.delete.bind(UserController));
router.put("/update/:id", UserController.update.bind(UserController));
router.post("/lock/:id", UserController.lockUser.bind(UserController));
router.post("/lock/:id", UserController.lockUser.bind(UserController));

export default router;