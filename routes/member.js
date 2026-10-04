const express = require("express");
const router = express.Router();
const path = require("path");
const memberController = require("../controller/memberController");

router.use(express.json());
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..",  "public", "member.html"));
})
router.get('/me', memberController.checkAuth);

module.exports = router;