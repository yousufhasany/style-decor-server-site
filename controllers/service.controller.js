const Service = require('../models/service.model');

// Get all services with search, filter, and pagination
exports.getAllServices = async (req, res) => {
  try {
    const {
      search,
      category,
      minCost,
      maxCost,
      page = 1,
      limit = 10,
      sort = '-createdAt'
    } = req.query;

    // Build query
    const query = {};

    // Search by service name
    if (search) {
      query.service_name = { $regex: search, $options: 'i' };
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by budget range
    if (minCost || maxCost) {
      query.cost = {};
      if (minCost) query.cost.$gte = Number(minCost);
      if (maxCost) query.cost.$lte = Number(maxCost);
    }

    // Calculate pagination
    const skip = (Number(page) - 1) * Number(limit);

    // Execute query
    const services = await Service.find(query)
      .sort(sort)
      .skip(skip)
      .limit(Number(limit));

    // Get total count for pagination
    const total = await Service.countDocuments(query);

    res.status(200).json({
      success: true,
      data: services,
      pagination: {
        currentPage: Number(page),
        totalPages: Math.ceil(total / Number(limit)),
        totalItems: total,
        itemsPerPage: Number(limit)
      }
    });
  } catch (error) {
    console.error('Get all services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch services',
      error: error.message
    });
  }
};

// Get service by ID
exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      data: service
    });
  } catch (error) {
    console.error('Get service by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch service',
      error: error.message
    });
  }
};

// Create new service (Admin only)
exports.createService = async (req, res) => {
  try {
    const { service_name, cost, unit, category, description, image } = req.body;

    // Get creator email from authenticated user
    const createdByEmail = req.user?.email || req.body.createdByEmail;

    const service = await Service.create({
      service_name,
      cost,
      unit,
      category,
      description,
      image,
      createdByEmail
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      data: service
    });
  } catch (error) {
    console.error('Create service error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to create service',
      error: error.message
    });
  }
};

// Update service (Admin only)
exports.updateService = async (req, res) => {
  try {
    const { service_name, cost, unit, category, description, image } = req.body;

    const service = await Service.findByIdAndUpdate(
      req.params.id,
      { service_name, cost, unit, category, description, image },
      { new: true, runValidators: true }
    );

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service updated successfully',
      data: service
    });
  } catch (error) {
    console.error('Update service error:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to update service',
      error: error.message
    });
  }
};

// Delete service (Admin only)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findByIdAndDelete(req.params.id);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Service deleted successfully'
    });
  } catch (error) {
    console.error('Delete service error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete service',
      error: error.message
    });
  }
};

// Get service categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Service.distinct('category');

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories',
      error: error.message
    });
  }
};

// Get featured services (for home page)
exports.getFeaturedServices = async (req, res) => {
  try {
    const limit = req.query.limit || 6;
    
    const services = await Service.find()
      .sort('-createdAt')
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: services
    });
  } catch (error) {
    console.error('Get featured services error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch featured services',
      error: error.message
    });
  }
};
