const express = require('express');
const router = express.Router();
const path = require('path');
const adminController = require('../controller/adminController');

router.use(express.json());

router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'admin.html'));
})
router.post('/login', adminController.login);
router.post('/signup', adminController.signup);
router.get('/me', adminController.checkAuth);
router.get('/projects', adminController.getProjects);
router.get('/projects/:email', adminController.getProjByEmail)
router.post('/projects/add', adminController.addProject);
router.post('/projects/edit', adminController.editProject);
router.delete('/projects/delete', adminController.requireAuth, adminController.delProject);
router.get('/events', adminController.getEvents);
router.post('/events/add', adminController.addEvents);
router.delete('/events/delete', adminController.requireAuth, adminController.delEvent);
router.get('/announcements', adminController.getAnnouncements);
router.post('/announcements/add', adminController.requireAuth, adminController.newAnnouncement);
router.delete('/announcements/delete', adminController.requireAuth, adminController.delAnnouncement);
router.get('/members', adminController.getMembers);
router.get('/members/:email', adminController.getMemByEmail);
router.post('/message', adminController.msgMember);
router.post('/contact', adminController.sendMsg);
module.exports = router;