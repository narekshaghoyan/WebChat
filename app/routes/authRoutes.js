const express = require("express");
const router = express.Router()

const app = require("../../server");
const { signUp, Login } = require("../controllers/authController");

router.post("/signup", signUp)
router.post("/login", Login)

module.exports = router