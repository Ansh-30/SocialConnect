const mongoose = require('mongoose');

const bcrypt = require('bcryptjs');


// ─────────────────────────────────────────────
// User Schema
// ─────────────────────────────────────────────

const userSchema = new mongoose.Schema(

  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 60,
    },

    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      minlength: 3,
      maxlength: 30,

      match: [
        /^[a-z0-9_]+$/,
        'Letters, numbers and underscores only',
      ],
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,

      match: [
        /^\S+@\S+\.\S+$/,
        'Invalid email',
      ],
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
      select: false,
    },


    // Profile
    avatar: {
      type: String,
      default: '',
    },

    bio: {
      type: String,
      default: '',
      maxlength: 200,
    },

    website: {
      type: String,
      default: '',
    },

    location: {
      type: String,
      default: '',
    },


    // Social
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],

    savedPosts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
      },
    ],


    // Authentication
    currentToken: {
      type: String,
      default: null,
    },


    // Roles & Status
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },

  {
    timestamps: true,
  }
);


// ─────────────────────────────────────────────
// Hash Password Before Save
// ─────────────────────────────────────────────

userSchema.pre(
  'save',

  async function (next) {

    if (!this.isModified('password')) {

      return next();
    }

    this.password =
      await bcrypt.hash(
        this.password,
        12
      );

    next();
  }
);


// ─────────────────────────────────────────────
// Compare Password Method
// ─────────────────────────────────────────────

userSchema.methods.matchPassword =
  function (candidate) {

    return bcrypt.compare(
      candidate,
      this.password
    );
  };


// ─────────────────────────────────────────────
// Remove Sensitive Data
// ─────────────────────────────────────────────

userSchema.methods.toJSON =
  function () {

    const obj =
      this.toObject();

    delete obj.password;

    delete obj.currentToken;

    return obj;
  };


// ─────────────────────────────────────────────
// Export Model
// ─────────────────────────────────────────────

module.exports =
  mongoose.model(
    'User',
    userSchema
  );