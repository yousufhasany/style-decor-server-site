const express = require('express');
const router = express.Router();
const {
  createOrUpdateUser,
  getAllDecorators,
  makeDecorator,
  toggleDecoratorApproval,
  updateDecoratorProfile,
  getAllUsers,
  updateUserRole,
  getUserById,
  searchUserByEmail
} = require('../controllers/user.controller');
const { hybridAuth, restrictTo, requireApprovedDecorator } = require('../middlewares/hybridAuth.middleware');

// Public route to create or update a user record from the client
// Used after Firebase registration / Google sign-in so users are stored in MongoDB
router.post('/users', createOrUpdateUser);

// Admin routes
router.get('/users', hybridAuth, restrictTo('admin'), getAllUsers);
router.get('/users/search', hybridAuth, restrictTo('admin'), searchUserByEmail);
router.get('/users/:userId', hybridAuth, getUserById); // Any authenticated user can get their own data
router.patch('/users/:userId/role', hybridAuth, restrictTo('admin'), updateUserRole);
router.get('/decorators', hybridAuth, restrictTo('admin'), getAllDecorators);
router.post('/decorators/make', hybridAuth, restrictTo('admin'), makeDecorator);
router.patch('/decorators/:decoratorId/approval', hybridAuth, restrictTo('admin'), toggleDecoratorApproval);

// Decorator routes
router.patch('/decorator/profile', hybridAuth, restrictTo('decorator'), updateDecoratorProfile);

module.exports = router;
