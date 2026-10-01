const express = require('express');
const router = express.Router();
const path = require('path');
const loginController = require('../controller/loginController');
router.use(express.json());
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
} )
router.post('/')