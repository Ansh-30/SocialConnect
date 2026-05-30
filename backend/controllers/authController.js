const { validationResult } = require('express-validator');

const User = require('../models/User');

const { signToken } = require('../middleware/auth');


// ─────────────────────────────────────────────
// REGISTER
// POST /api/auth/register
// ─────────────────────────────────────────────

exports.register = async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  try {

    const {
      name,
      username,
      email,
      password,
    } = req.body;


    // Check Existing User
    const existing =
      await User.findOne({
        $or: [
          { email },
          { username },
        ],
      });

    if (existing) {

      const field =
        existing.email === email
          ? 'Email'
          : 'Username';

      return res.status(409).json({
        success: false,
        message: `${field} already taken`,
      });
    }


    // Create User
    const user = await User.create({
      name,
      username,
      email,
      password,
    });


    // Generate JWT
    const token =
      signToken(user._id);


    // Save Active Token
    user.currentToken = token;

    await user.save();


    // Response
    res.status(201).json({
      success: true,
      token,
      user: user.toJSON(),
    });

  } catch (err) {

    console.error(
      'REGISTER ERROR:',
      err.message
    );

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};


// ─────────────────────────────────────────────
// LOGIN
// POST /api/auth/login
// ─────────────────────────────────────────────

exports.login = async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {

    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
    });
  }

  try {

    const {
      email,
      password,
    } = req.body;


    // Find User
    const user =
      await User.findOne({ email })
        .select('+password');


    // Invalid Credentials
    if (
      !user ||
      !(await user.matchPassword(password))
    ) {

      return res.status(401).json({
        success: false,
        message:
          'Invalid email or password',
      });
    }


    // Account Disabled
    if (!user.isActive) {

      return res.status(403).json({
        success: false,
        message:
          'Account has been deactivated',
      });
    }


    // Generate New Token
    const token =
      signToken(user._id);


    // SINGLE DEVICE LOGIN
    // Save Latest Token
    user.currentToken = token;

    await user.save();


    // Response
    res.json({
      success: true,
      token,
      user: user.toJSON(),
    });

  } catch (err) {

    console.error(
      'LOGIN ERROR:',
      err.message
    );

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};


// ─────────────────────────────────────────────
// GET CURRENT USER
// GET /api/auth/me
// ─────────────────────────────────────────────

exports.getMe = async (req, res) => {

  try {

    const user =
      await User.findById(req.user._id)

        .populate(
          'followers',
          'name username avatar'
        )

        .populate(
          'following',
          'name username avatar'
        );


    if (!user) {

      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }


    res.json({
      success: true,
      user,
    });

  } catch (err) {

    console.error(
      'GET ME ERROR:',
      err.message
    );

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};


// ─────────────────────────────────────────────
// LOGOUT
// POST /api/auth/logout
// ─────────────────────────────────────────────

exports.logout = async (req, res) => {

  try {

    const user =
      await User.findById(req.user._id);

    if (user) {

      user.currentToken = null;

      await user.save();
    }

    res.json({
      success: true,
      message: 'Logged out successfully',
    });

  } catch (err) {

    console.error(
      'LOGOUT ERROR:',
      err.message
    );

    res.status(500).json({
      success: false,
      message: 'Server Error',
    });
  }
};