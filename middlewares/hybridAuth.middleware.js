const jwt = require('jsonwebtoken');
const { getFirebaseAdmin } = require('../config/firebase');
const User = require('../models/user.model');

// Hybrid authentication middleware - supports both JWT and Firebase tokens
const hybridAuth = async (req, res, next) => {
  try {
    let token;
    let authType = 'none';

    // Extract token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login to access this resource.'
      });
    }

    try {
      // Try Firebase token first
      const admin = getFirebaseAdmin();
      const decodedFirebaseToken = await admin.auth().verifyIdToken(token);
      
      authType = 'firebase';
      
      // Find or create user from Firebase token
      let user = await User.findOne({ firebaseUid: decodedFirebaseToken.uid });
      
      if (!user) {
        // Create new user from Firebase data
        user = new User({
          firebaseUid: decodedFirebaseToken.uid,
          email: decodedFirebaseToken.email,
          name: decodedFirebaseToken.name || decodedFirebaseToken.email.split('@')[0],
          photoURL: decodedFirebaseToken.picture,
          phoneNumber: decodedFirebaseToken.phone_number,
          isActive: true,
          role: 'user' // Default role, admin can change later
        });
        await user.save();
      }

      // Attach user to request
      req.user = user;
      req.authType = authType;
      return next();

    } catch (firebaseError) {
      // If Firebase verification fails, try JWT
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-this');
        
        authType = 'jwt';
        
        // Get user from JWT token
        const user = await User.findById(decoded.id).select('-password');

        if (!user) {
          return res.status(401).json({
            success: false,
            message: 'User not found. Token is invalid.'
          });
        }

        // Check if user is active
        if (!user.isActive) {
          return res.status(401).json({
            success: false,
            message: 'Account is deactivated. Please contact support.'
          });
        }

        // Attach user to request
        req.user = user;
        req.authType = authType;
        return next();

      } catch (jwtError) {
        // Both authentication methods failed
        if (jwtError.name === 'JsonWebTokenError') {
          return res.status(401).json({
            success: false,
            message: 'Invalid token. Please login again.'
          });
        }

        if (jwtError.name === 'TokenExpiredError') {
          return res.status(401).json({
            success: false,
            message: 'Token expired. Please login again.'
          });
        }

        return res.status(401).json({
          success: false,
          message: 'Authentication failed. Invalid token.'
        });
      }
    }
  } catch (error) {
    console.error('Hybrid auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Restrict to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. Please login first.'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. This resource requires one of the following roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};

// Check if decorator is approved (for decorator-specific routes)
const requireApprovedDecorator = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Please login first.'
    });
  }

  if (req.user.role !== 'decorator') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. This resource is only available to decorators.'
    });
  }

  if (!req.user.isApproved) {
    return res.status(403).json({
      success: false,
      message: 'Your decorator account is pending approval. Please contact admin.'
    });
  }

  next();
};

module.exports = {
  hybridAuth,
  restrictTo,
  requireApprovedDecorator
};
