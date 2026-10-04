const express = require('express');
const router = express.Router();
const path = require('path');
const authController = require('../controller/authController');
router.use(express.json());
router.post('/signin', authController.signIn);
router.post('/signup', authController.signUp);

module.exports = router;