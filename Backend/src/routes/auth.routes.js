const express = require('express');
const authController = require('../controllers/auth.controller')
const { authenticate } = require('../middlewares/auth.middlewares');

const route = express.Router();
route.post('/register', authController.registerUser)
route.post('/login', authController.loginUser)
route.post('/logout', authController.logoutUser)
route.get('/me', authenticate, authController.getMe);

module.exports = route;