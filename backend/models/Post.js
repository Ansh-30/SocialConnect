const mongoose = require('mongoose');

// ── Reply sub-document ───────────────────────────────────────────
const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true, maxlength: 500 },
}, { timestamps: true });

// ── Comment ──────────────────────────────────────────────────────
const commentSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  post:    { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  text:    { type: String, required: true, maxlength: 1000 },
  replies: [replySchema],
  likes:   [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

// ── Post ─────────────────────────────────────────────────────────
const postSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  caption: { type: String, default: '', maxlength: 2200 },
  image:   { type: String, default: '' },
  tags:    [{ type: String, lowercase: true, trim: true }],

  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
  savedBy:  [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  shares:   { type: Number, default: 0 },

  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Full-text index for search
postSchema.index({ caption: 'text', tags: 'text' });
postSchema.index({ createdAt: -1 });

const Post    = mongoose.model('Post',    postSchema);
const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Post, Comment };
