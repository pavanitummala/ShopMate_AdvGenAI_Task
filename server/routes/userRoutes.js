const express = require("express");
const router = express.Router();
const { registerUser } = require("../controllers/userControllers");
const { loginUser } = require("../controllers/userControllers");
const { refreshUserToken } = require("../controllers/userControllers");
const verifyEmail = require("../services/verify");

router.post("/register", registerUser);
router.get("/verify-email/:token", verifyEmail);
router.post("/login", loginUser);
router.post("/refresh", refreshUserToken);

module.exports = router;
