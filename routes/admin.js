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
module.exports = router