const jwt = require('jsonwebtoken');

const User = require('../models/User');


// ─────────────────────────────────────────────
// Protect Routes Middleware
// Verify JWT + Validate Active Session
// ─────────────────────────────────────────────

exports.protect = async (
  req,
  res,
  next
) => {

  try {

    const header =
      req.headers.authorization || '';


    // No Token
    if (
      !header.startsWith('Bearer ')
    ) {

      return res.status(401).json({
        success: false,
        message: 'No token provided',
      });
    }


    // Extract Token
    const token =
      header.split(' ')[1];


    // Verify JWT
    const decoded =
      jwt.verify(
        token,
        process.env.JWT_SECRET
      );


    // Find User
    const user =
      await User.findById(
        decoded.id
      );


    // User Missing
    if (!user) {

      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }


    // Account Disabled
    if (!user.isActive) {

      return res.status(403).json({
        success: false,
        message:
          'Account deactivated',
      });
    }


    // SINGLE DEVICE LOGIN CHECK
    // Reject old sessions
    if (
      user.currentToken !== token
    ) {

      return res.status(401).json({
        success: false,
        message:
          'Session expired. Please login again.',
      });
    }


    // Attach User
    req.user = user;

    next();

  } catch (err) {

    console.error(
      'AUTH ERROR:',
      err.message
    );

    return res.status(401).json({
      success: false,
      message:
        'Invalid or expired token',
    });
  }
};


// ─────────────────────────────────────────────
// Admin Only Middleware
// Must be used AFTER protect
// ─────────────────────────────────────────────

exports.adminOnly = (
  req,
  res,
  next
) => {

  if (
    req.user?.role !== 'admin'
  ) {

    return res.status(403).json({
      success: false,
      message: 'Admins only',
    });
  }

  next();
};


// ─────────────────────────────────────────────
// Generate JWT Token
// ─────────────────────────────────────────────

exports.signToken = (id) => {

  return jwt.sign(

    { id },

    process.env.JWT_SECRET,

    {
      expiresIn:
        process.env.JWT_EXPIRES_IN ||
        '7d',
    }
  );
};