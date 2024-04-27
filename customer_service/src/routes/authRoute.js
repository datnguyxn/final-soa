const express = require("express");
const router = express.Router();

const {signUp, activateAccount, login} = require("../controllers/authController");

router.post('/signup',signUp)
router.get('/activate',activateAccount)
router.post('/login',login)


module.exports = router