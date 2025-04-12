const express = require("express");
const router = express.Router();

const {getAccountDetails,getAllUserAccounts,createAccount,deleteAccount,updateAccount} = require('../controllers/account.controller')

router.post("/create",createAccount);

router.patch("/:accountId/updateMoney",deleteAccount);

router.get("/:accountId",getAccountDetails);

router.delete("/:accountId",updateAccount);

router.get("/",getAllUserAccounts);

module.exports = router;