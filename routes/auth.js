const { Router } = require('express');
const { signup, login } = require('../controllers/authController.js');
const requireAuth = require('../middleware/authMiddleware.js');

const authRouter = Router();

// new user accounts must be manually created via postman using
// the existing dev / admin user account JWT in the db
authRouter.post('/signup', requireAuth, signup);

authRouter.post('/login', login);

module.exports = authRouter;