const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { protect } = require('../middlewares/auth.middleware');
const { restrictTo } = require('../middlewares/hybridAuth.middleware');

// Public routes
router.get('/', serviceController.getAllServices);
router.get('/featured', serviceController.getFeaturedServices);
router.get('/categories', serviceController.getCategories);
router.get('/:id', serviceController.getServiceById);

// Protected routes (Admin only)
router.post('/', protect, restrictTo('admin'), serviceController.createService);
router.put('/:id', protect, restrictTo('admin'), serviceController.updateService);
router.delete('/:id', protect, restrictTo('admin'), serviceController.deleteService);

module.exports = router;
