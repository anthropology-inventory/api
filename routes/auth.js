const { Router } = require('express');
const { signup, login } = require('../controllers/authController.js');
const requireAuth = require('../middleware/authMiddleware.js');
const requireAdmin = require('../middleware/requireAdminMiddleware.js');

const authRouter = Router();

// new user accounts can only be created by authenticated admin users
authRouter.post('/signup', requireAuth, requireAdmin, signup);

authRouter.post('/login', login);

module.exports = authRouter;