const express = require("express");
const router = express.Router()

const app = require("../../server");
const { signUp } = require("../controllers/authController");

router.post("/signup", signUp)

module.exports = router