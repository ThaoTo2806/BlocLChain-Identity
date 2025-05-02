const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const verifyIdentity = require("../middlewares/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/refresh-token", authController.refreshAccessToken);
router.post("/loginwithToken", authController.loginwithToken);
module.exports = router;
