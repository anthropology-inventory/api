const { Router } = require('express');
const {
    getAllUsers,
    getSingleUserById,
    updateUser,
    deleteUser
} = require('../controllers/userController.js');
const requireAuth = require('../middleware/authMiddleware.js');
const requireAdmin = require('../middleware/requireAdminMiddleware.js');

const usersRouter = Router();

// GET all users
usersRouter.get('/', requireAuth, requireAdmin, getAllUsers);

// GET single user by id
usersRouter.get('/:id', requireAuth, requireAdmin, getSingleUserById);

// PATCH a user by id
usersRouter.patch('/:id', requireAuth, requireAdmin, updateUser);

// DELETE a user by id
usersRouter.delete('/:id', requireAuth, requireAdmin, deleteUser);

module.exports = usersRouter;