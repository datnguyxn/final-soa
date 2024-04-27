const express = require("express");
const router = express.Router();

const {addFavorite, removeFavorite, getFavorite, checkFavorite} = require("../controllers/favoriteController");

router.post('/add',addFavorite)
router.post('/remove',removeFavorite)
router.get('/',getFavorite)
router.post('/check', checkFavorite)
module.exports = router