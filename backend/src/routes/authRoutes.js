const express = require('express');
const router = express.Router();
const { registerTenant, login } = require('../controllers/authController');

router.post('/register', registerTenant);
router.post('/login', login);

module.exports = router;