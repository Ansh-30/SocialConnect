const User = require('../models/User');
const { Post } = require('../models/Post');

// GET /api/search?q=&type=users|posts|tags
exports.search = async (req, res) => {
  try {
    const q    = (req.query.q || '').trim();
    const type = req.query.type || 'all';
    if (!q) return res.status(400).json({ success: false, message: 'Query required' });

    const results = {};

    if (type === 'all' || type === 'users') {
      results.users = await User.find({
        $or: [
          { name:     { $regex: q, $options: 'i' } },
          { username: { $regex: q, $options: 'i' } },
        ],
        isActive: true,
      }).select('name username avatar bio followers').limit(10);
    }

    if (type === 'all' || type === 'posts') {
      results.posts = await Post.find({
        $or: [
          { caption: { $regex: q, $options: 'i' } },
          { tags: { $in: [q.replace(/^#/, '').toLowerCase()] } },
        ],
        isDeleted: false,
      })
        .populate('user', 'name username avatar isVerified')
        .sort({ createdAt: -1 })
        .limit(10);
    }

    if (type === 'all' || type === 'tags') {
      const slug   = q.replace(/^#/, '').toLowerCase();
      const tags   = await Post.find({ tags: { $regex: slug, $options: 'i' }, isDeleted: false }).distinct('tags');
      results.tags = tags.filter(t => t.includes(slug)).slice(0, 12);
    }

    res.json({ success: true, results });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/search/tag/:tag
exports.getByTag = async (req, res) => {
  try {
    const tag   = req.params.tag.replace(/^#/, '').toLowerCase();
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;

    const posts = await Post.find({ tags: tag, isDeleted: false })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'name username avatar isVerified');

    const total = await Post.countDocuments({ tags: tag, isDeleted: false });
    res.json({ success: true, posts, tag, pagination: { page, limit, total } });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
