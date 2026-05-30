const path = require('path');
const fs   = require('fs');
const { Post, Comment } = require('../models/Post');
const User = require('../models/User');

const populatePost = (query) =>
  query
    .populate('user', 'name username avatar isVerified')
    .populate({
      path: 'comments',
      populate: [
        { path: 'user',          select: 'name username avatar' },
        { path: 'replies.user',  select: 'name username avatar' },
      ],
    });

// POST /api/posts
exports.createPost = async (req, res) => {
  try {
    const { caption, tags } = req.body;
    if (!caption?.trim() && !req.file)
      return res.status(400).json({ success: false, message: 'Caption or image required' });

    const post = await Post.create({
      user:    req.user._id,
      caption: caption || '',
      image:   req.file ? `/uploads/${req.file.filename}` : '',
      tags:    tags ? tags.split(',').map(t => t.trim().replace(/^#/, '').toLowerCase()).filter(Boolean) : [],
    });
    await populatePost(Post.findById(post._id)).then(p => res.status(201).json({ success: true, post: p }));
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/posts
exports.getPosts = async (req, res) => {
  try {
    const page  = parseInt(req.query.page)  || 1;
    const limit = parseInt(req.query.limit) || 10;
    const feed  = req.query.feed || 'latest';   // latest | trending | following

    let filter = { isDeleted: false };
    if (feed === 'following') {
      const me    = await User.findById(req.user._id);
      filter.user = { $in: [...me.following, req.user._id] };
    }

    const sort = feed === 'trending'
      ? { 'likes.length': -1, createdAt: -1 }  // approximate; real trending uses aggregation
      : { createdAt: -1 };

    // For trending we use aggregation to sort by likes count
    let posts;
    if (feed === 'trending') {
      posts = await Post.aggregate([
        { $match: filter },
        { $addFields: { likeCount: { $size: '$likes' } } },
        { $sort: { likeCount: -1, createdAt: -1 } },
        { $skip: (page - 1) * limit },
        { $limit: limit },
      ]);
      // Populate after aggregation
      posts = await Post.populate(posts, [
        { path: 'user',     select: 'name username avatar isVerified' },
        { path: 'comments', populate: { path: 'user', select: 'name username avatar' } },
      ]);
    } else {
      posts = await Post.find(filter)
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('user', 'name username avatar isVerified')
        .populate({ path: 'comments', populate: { path: 'user', select: 'name username avatar' } });
    }

    const total = await Post.countDocuments(filter);
    res.json({
      success: true, posts,
      pagination: { page, limit, total, pages: Math.ceil(total / limit), hasMore: page * limit < total },
    });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// GET /api/posts/:id
exports.getPost = async (req, res) => {
  try {
    const post = await populatePost(Post.findOne({ _id: req.params.id, isDeleted: false }));
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, post });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/posts/:id
exports.updatePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    const { caption, tags } = req.body;
    if (caption !== undefined) post.caption = caption;
    if (tags    !== undefined)
      post.tags = tags.split(',').map(t => t.trim().replace(/^#/, '').toLowerCase()).filter(Boolean);

    if (req.file) {
      if (post.image) { const p = path.join(__dirname, '..', post.image); if (fs.existsSync(p)) fs.unlinkSync(p); }
      post.image = `/uploads/${req.file.filename}`;
    }
    await post.save();
    const updated = await populatePost(Post.findById(post._id));
    res.json({ success: true, post: updated });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// DELETE /api/posts/:id
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    const isOwner = post.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    post.isDeleted = true;
    await post.save();
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/posts/like/:id
exports.toggleLike = async (req, res) => {
  try {
    const post    = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const liked = post.likes.map(String).includes(req.user._id.toString());
    if (liked) post.likes.pull(req.user._id);
    else       post.likes.addToSet(req.user._id);
    await post.save();
    res.json({ success: true, isLiked: !liked, likesCount: post.likes.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/posts/share/:id
exports.sharePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, { $inc: { shares: 1 } }, { new: true });
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    res.json({ success: true, shares: post.shares });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// ── Comments ────────────────────────────────────────────────────

// POST /api/posts/comment/:postId
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Text required' });

    const post    = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({ user: req.user._id, post: post._id, text });
    post.comments.push(comment._id);
    await post.save();
    await comment.populate('user', 'name username avatar');
    res.status(201).json({ success: true, comment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// PUT /api/posts/comment/:commentId
exports.editComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    comment.text = req.body.text;
    await comment.save();
    await comment.populate('user', 'name username avatar');
    res.json({ success: true, comment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// DELETE /api/posts/comment/:commentId
exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    const isOwner = comment.user.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Unauthorized' });

    await Post.findByIdAndUpdate(comment.post, { $pull: { comments: comment._id } });
    await comment.deleteOne();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};

// POST /api/posts/comment/:commentId/reply
exports.addReply = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ success: false, message: 'Text required' });

    const comment = await Comment.findById(req.params.commentId);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.replies.push({ user: req.user._id, text });
    await comment.save();
    await comment.populate('replies.user', 'name username avatar');
    res.json({ success: true, comment });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
};
