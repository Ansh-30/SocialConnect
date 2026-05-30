const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/** Verify Bearer token, attach req.user */
exports.protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer '))
      return res.status(401).json({ success: false, message: 'No token provided' });

    const token   = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);

    if (!user)           return res.status(401).json({ success: false, message: 'User not found' });
    if (!user.isActive)  return res.status(403).json({ success: false, message: 'Account deactivated' });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

/** Admin-only gate – must come AFTER protect */
exports.adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin')
    return res.status(403).json({ success: false, message: 'Admins only' });
  next();
};

/** Sign a JWT for the given user id */
exports.signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
