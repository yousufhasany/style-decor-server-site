const User = require('../models/user.model');

// Create or update user from public client (Firebase-based auth)
// This is used when users register or sign in with Firebase on the frontend
const createOrUpdateUser = async (req, res) => {
  try {
    const { uid, name, email, phone, photoURL } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const normalizedEmail = email.toLowerCase();

    // Try to find existing user either by firebaseUid or email
    let user = null;
    if (uid) {
      user = await User.findOne({ firebaseUid: uid });
    }

    if (!user) {
      user = await User.findOne({ email: normalizedEmail });
    }

    // If user exists, update basic profile info
    if (user) {
      user.name = name || user.name || normalizedEmail.split('@')[0];
      user.email = normalizedEmail;
      if (uid) user.firebaseUid = uid;
      if (phone) user.phoneNumber = phone;
      if (photoURL) user.photoURL = photoURL;
      // Do NOT change role here; role is managed by admin tools
      await user.save();
    } else {
      // New user: create with a random password placeholder (since Firebase handles auth)
      const randomPassword = 'firebase-' + Math.random().toString(36).substring(2, 10);

      user = new User({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        password: randomPassword,
        role: 'user',
        firebaseUid: uid || undefined,
        phoneNumber: phone || undefined,
        photoURL: photoURL || undefined
      });

      await user.save();
    }

    // Hide password in response
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(200).json({
      success: true,
      message: 'User synced successfully',
      data: userObj
    });
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create or update user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get all decorators (Admin only)
const getAllDecorators = async (req, res) => {
  try {
    const decorators = await User.find({ role: 'decorator' })
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: decorators.length,
      data: decorators
    });
  } catch (error) {
    console.error('Error fetching decorators:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch decorators',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Make user a decorator (Admin only)
const makeDecorator = async (req, res) => {
  try {
    const { userId, specialties } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'User ID is required'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update user role to decorator
    user.role = 'decorator';
    user.specialties = specialties || [];
    user.isApproved = false; // Needs approval

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated to decorator',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        specialties: user.specialties,
        isApproved: user.isApproved
      }
    });
  } catch (error) {
    console.error('Error making decorator:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Approve/Disable decorator account (Admin only)
const toggleDecoratorApproval = async (req, res) => {
  try {
    const { decoratorId } = req.params;
    const { isApproved } = req.body;

    const decorator = await User.findById(decoratorId);

    if (!decorator || decorator.role !== 'decorator') {
      return res.status(404).json({
        success: false,
        message: 'Decorator not found'
      });
    }

    decorator.isApproved = isApproved;
    await decorator.save();

    res.status(200).json({
      success: true,
      message: `Decorator ${isApproved ? 'approved' : 'disabled'} successfully`,
      data: {
        id: decorator._id,
        name: decorator.name,
        isApproved: decorator.isApproved
      }
    });
  } catch (error) {
    console.error('Error toggling decorator approval:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update decorator status',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update decorator profile (Decorator only)
const updateDecoratorProfile = async (req, res) => {
  try {
    const { specialties, phoneNumber, photoURL } = req.body;

    const decorator = req.user;

    if (specialties) decorator.specialties = specialties;
    if (phoneNumber) decorator.phoneNumber = phoneNumber;
    if (photoURL) decorator.photoURL = photoURL;

    await decorator.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: decorator._id,
        name: decorator.name,
        email: decorator.email,
        specialties: decorator.specialties,
        phoneNumber: decorator.phoneNumber,
        photoURL: decorator.photoURL
      }
    });
  } catch (error) {
    console.error('Error updating decorator profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get all users (Admin only)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch users',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Update user role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!['user', 'admin', 'decorator'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, admin, or decorator'
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    if (role === 'decorator') {
      user.isApproved = false; // Needs approval
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update user role',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Get user by Firebase UID or MongoDB ID (auto-creates if not exists)
const getUserById = async (req, res) => {
  try {
    const { userId } = req.params;

    // Try finding by firebaseUid first, then by _id
    let user = await User.findOne({ firebaseUid: userId }).select('-password');
    
    if (!user) {
      user = await User.findById(userId).select('-password').catch(() => null);
    }

    // If user doesn't exist and we have Firebase user data, create it
    if (!user && req.user) {
      console.log('🔥 Creating user in MongoDB from Firebase:', req.user.email);
      
      user = new User({
        name: req.user.name || req.user.email?.split('@')[0] || 'User',
        email: req.user.email,
        firebaseUid: userId,
        password: 'firebase-' + Math.random().toString(36).substring(7),
        role: 'user',
        photoURL: req.user.picture || req.user.photoURL || null
      });
      
      await user.save();
      console.log('✅ User created in MongoDB:', user.email, 'Role:', user.role);
      
      // Convert to plain object and remove password
      user = user.toObject();
      delete user.password;
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user: user,
      role: user.role
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

// Search user by email (Admin only)
const searchUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() })
      .select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Error searching user:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to search user',
      error: process.env.NODE_ENV === 'development' ? error.message : {}
    });
  }
};

module.exports = {
  createOrUpdateUser,
  getAllDecorators,
  makeDecorator,
  toggleDecoratorApproval,
  updateDecoratorProfile,
  getAllUsers,
  updateUserRole,
  getUserById,
  searchUserByEmail
};
