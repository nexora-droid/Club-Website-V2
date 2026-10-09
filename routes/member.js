const express = require("express");
const router = express.Router();
const path = require("path");
const memberController = require("../controller/memberController");

router.use(express.json({limit: '10mb'}));
router.use(express.urlencoded({limit: '10mb', extended: true}))
router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..",  "public", "member.html"));
})
router.get('/me', memberController.checkAuth);
router.get('/meetings', memberController.getMeetings);
router.get('/events', memberController.getEvents);
router.get('/projects', memberController.getProjects);
router.get('/announcements', memberController.getAnnouncements);
router.get('/explore/data', memberController.requireAuth, memberController.getUsers);
router.get('/leaderboard', memberController.leaderboard);
router.post('/photos/upload', memberController.requireAuth, memberController.addPhoto);
router.get('/photos/mine', memberController.requireAuth, memberController.getPhoto);
router.delete('/photos/delete', memberController.requireAuth, memberController.deletePhoto);
router.get('/settings', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'membersettings.html'));
})
router.get('/support', (req, res)=> {
    res.sendFile(path.join(__dirname, '..', "public", "chat.html"));
})
router.post('/support/ai', memberController.sendMsg);
router.use((req, res, next)=> {
    res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
})
module.exports = router;