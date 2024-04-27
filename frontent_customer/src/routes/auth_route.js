const express = require('express')
const router = express.Router()

const {getPage, login, signup} = require ("../controllers/auth_controller")

router.get("/", getPage)
router.post("/login", login)
router.post("/signup", signup)

module.exports = router