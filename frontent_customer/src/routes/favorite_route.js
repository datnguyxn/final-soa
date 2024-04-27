const express = require('express')
const router = express.Router()

const {getPage, deleteFavorite, addFavorite} = require("../controllers/favorite_controller")

router.get("/", getPage)
router.post('/add',addFavorite)
router.post('/remove',deleteFavorite)

module.exports = router