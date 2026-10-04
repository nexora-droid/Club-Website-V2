const express = require("express");
const router = express.Router();
const path = require("path");
const memberController = require("../controller/memberController");

router.use(express.json());
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..",  "public", "member.html"));
})
router.get('/me', memberController.checkAuth);
router.get('/meetings', memberController.getMeetings);
router.get('/events', memberController.getEvents);
router.get('/projects', memberController.getProjects);

module.exports = router;