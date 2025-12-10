const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/auth.controller');

// POST /api/auth/register - Register new user
router.post('/register', register);

// POST /api/auth/login - Login user
router.post('/login', login);

module.exports = router;
