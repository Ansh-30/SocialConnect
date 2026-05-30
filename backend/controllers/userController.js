const path = require('path');
const fs   = require('fs');
const User = require('../models/User');
const { Post } = require('../models/Post');

// GET /api/users/:id
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'name username avatar')
      .populate('following', 'name username avatar');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/users/by-username/:username
exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .populate('followers', 'name username avatar')
      .populate('following', 'name username avatar');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/users/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, bio, website, location } = req.body;
    const data = { name, bio, website, location };

    if (req.file) {
      // Remove old avatar file if stored locally
      const current = await User.findById(req.user._id);
      if (current.avatar?.startsWith('/uploads/')) {
        const old = path.join(__dirname, '..', current.avatar);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      data.avatar = `/uploads/${req.file.filename}`;
    }

    const user = await User.findByIdAndUpdate(req.user._id, data, { new: true, runValidators: true })
      .populate('followers', 'name username avatar')
      .populate('following', 'name username avatar');
    res.json({ success: true, user });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/users/follow/:id
exports.toggleFollow = async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You can't follow yourself" });

    const target = await User.findById(req.params.id);
    if (!target) return res.status(404).json({ success: false, message: 'User not found' });

    const me          = await User.findById(req.user._id);
    const isFollowing = me.following.map(String).includes(req.params.id);

    if (isFollowing) {
      await User.findByIdAndUpdate(req.user._id,   { $pull: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id,   { $pull: { followers: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id,   { $addToSet: { following: req.params.id } });
      await User.findByIdAndUpdate(req.params.id,   { $addToSet: { followers: req.user._id } });
    }

    res.json({ success: true, isFollowing: !isFollowing });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/users/:id/posts
exports.getUserPosts = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 12;

    const posts = await Post.find({ user: req.params.id, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name username avatar isVerified');

    const total = await Post.countDocuments({ user: req.params.id, isDeleted: false });
    res.json({ success: true, posts, pagination: { page, limit, total, pages: Math.ceil(total / limit) } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/users/suggestions
exports.getSuggestions = async (req, res) => {
  try {
    const me      = await User.findById(req.user._id);
    const exclude = [...me.following.map(String), req.user._id.toString()];
    const users   = await User.find({ _id: { $nin: exclude }, isActive: true })
      .select('name username avatar bio followers')
      .limit(8);
    res.json({ success: true, users });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/users/save/:postId
exports.toggleSave = async (req, res) => {
  try {
    const user   = await User.findById(req.user._id);
    const saved  = user.savedPosts.map(String).includes(req.params.postId);

    if (saved) {
      await User.findByIdAndUpdate(req.user._id,         { $pull:    { savedPosts: req.params.postId } });
      await Post.findByIdAndUpdate(req.params.postId,    { $pull:    { savedBy: req.user._id } });
    } else {
      await User.findByIdAndUpdate(req.user._id,         { $addToSet: { savedPosts: req.params.postId } });
      await Post.findByIdAndUpdate(req.params.postId,    { $addToSet: { savedBy: req.user._id } });
    }
    res.json({ success: true, isSaved: !saved });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/users/saved-posts
exports.getSavedPosts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedPosts',
      match: { isDeleted: false },
      populate: { path: 'user', select: 'name username avatar isVerified' },
      options: { sort: { createdAt: -1 } },
    });
    res.json({ success: true, posts: user.savedPosts });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
