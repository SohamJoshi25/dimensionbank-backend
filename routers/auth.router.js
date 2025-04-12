const express = require("express");
const { login, twofa, deleteAccount } = require("../controllers/auth.controller");
const router = express.Router();

router.post("/2fa",twofa);

router.post("/login",login);

router.post("/delete",deleteAccount);

module.exports = router;