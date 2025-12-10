const express = require('express');
const router = express.Router();
const {
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
