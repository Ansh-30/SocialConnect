const User = require('../models/User');
const { Post, Comment } = require('../models/Post');

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [totalUsers, totalPosts, totalComments, newToday] = await Promise.all([
      User.countDocuments(),
      Post.countDocuments({ isDeleted: false }),
      Comment.countDocuments(),
      User.countDocuments({ createdAt: { $gte: new Date(Date.now() - 86_400_000) } }),
    ]);

    const topPosts    = await Post.find({ isDeleted: false }).sort({ likes: -1 }).limit(5).populate('user', 'name username avatar');
    const recentUsers = await User.find().sort({ createdAt: -1 }).limit(5).select('name username avatar createdAt role isActive');

    res.json({ success: true, stats: { totalUsers, totalPosts, totalComments, newToday }, topPosts, recentUsers });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const page   = parseInt(req.query.page)   || 1;
    const limit  = parseInt(req.query.limit)  || 20;
    const search = req.query.search || '';

    const filter = search ? {
      $or: [
        { name:  { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
      ],
    } : {};

    const users = await User.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).select('-password');
    const total = await User.countDocuments(filter);
    res.json({ success: true, users, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/admin/users/:id/toggle-status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    if (user.role === 'admin') return res.status(400).json({ success: false, message: 'Cannot deactivate admin' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user, message: `User ${user.isActive ? 'activated' : 'deactivated'}` });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/admin/posts
exports.getAllPosts = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 20;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name username avatar');
    const total = await Post.countDocuments();
    res.json({ success: true, posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// DELETE /api/admin/posts/:id  (hard delete)
exports.hardDeletePost = async (req, res) => {
  try {
    await Post.findByIdAndDelete(req.params.id);
    await Comment.deleteMany({ post: req.params.id });
    res.json({ success: true, message: 'Post permanently deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
