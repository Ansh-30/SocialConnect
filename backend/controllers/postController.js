const { Post, Comment } = require('../models/Post');

const User = require('../models/User');


// ─────────────────────────────────────────────
// Populate Helper
// ─────────────────────────────────────────────

const populatePost = (query) =>

  query

    .populate(
      'user',
      'name username avatar isVerified'
    )

    .populate({

      path: 'comments',

      populate: [

        {
          path: 'user',
          select: 'name username avatar',
        },

        {
          path: 'replies.user',
          select: 'name username avatar',
        },
      ],
    });


// ─────────────────────────────────────────────
// CREATE POST
// POST /api/posts
// ─────────────────────────────────────────────

exports.createPost = async (
  req,
  res
) => {

  try {

    const {
      caption,
      tags,
    } = req.body;


    // Validation
    if (
      !caption?.trim() &&
      !req.file
    ) {

      return res.status(400).json({

        success: false,

        message:
          'Caption or image required',
      });
    }


    // Create Post
    const post =
      await Post.create({

        user: req.user._id,

        caption:
          caption || '',

        // CLOUDINARY IMAGE URL
        image: req.file
          ? req.file.path
          : '',

        tags: tags

          ? tags

              .split(',')

              .map((t) =>

                t
                  .trim()
                  .replace(/^#/, '')
                  .toLowerCase()
              )

              .filter(Boolean)

          : [],
      });


    // Populate Response
    const populated =
      await populatePost(
        Post.findById(post._id)
      );


    res.status(201).json({

      success: true,

      post: populated,
    });

  } catch (err) {

    console.error(
      'CREATE POST ERROR:',
      err.message
    );

    res.status(500).json({

      success: false,

      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────
// GET POSTS
// GET /api/posts
// ─────────────────────────────────────────────

exports.getPosts = async (
  req,
  res
) => {

  try {

    const page =
      parseInt(req.query.page) || 1;

    const limit =
      parseInt(req.query.limit) || 10;

    const feed =
      req.query.feed || 'latest';


    let filter = {

      isDeleted: false,
    };


    // Following Feed
    if (feed === 'following') {

      const me =
        await User.findById(
          req.user._id
        );

      filter.user = {

        $in: [
          ...me.following,
          req.user._id,
        ],
      };
    }


    const sort =
      feed === 'trending'

        ? {
            createdAt: -1,
          }

        : {
            createdAt: -1,
          };


    let posts;


    // Trending Feed
    if (feed === 'trending') {

      posts =
        await Post.aggregate([

          {
            $match: filter,
          },

          {
            $addFields: {

              likeCount: {
                $size: '$likes',
              },
            },
          },

          {
            $sort: {

              likeCount: -1,

              createdAt: -1,
            },
          },

          {
            $skip:
              (page - 1) * limit,
          },

          {
            $limit: limit,
          },
        ]);


      posts =
        await Post.populate(posts, [

          {
            path: 'user',

            select:
              'name username avatar isVerified',
          },

          {
            path: 'comments',

            populate: {

              path: 'user',

              select:
                'name username avatar',
            },
          },
        ]);

    } else {

      posts =
        await Post.find(filter)

          .sort(sort)

          .skip(
            (page - 1) * limit
          )

          .limit(limit)

          .populate(
            'user',
            'name username avatar isVerified'
          )

          .populate({

            path: 'comments',

            populate: {

              path: 'user',

              select:
                'name username avatar',
            },
          });
    }


    const total =
      await Post.countDocuments(
        filter
      );


    res.json({

      success: true,

      posts,

      pagination: {

        page,

        limit,

        total,

        pages: Math.ceil(
          total / limit
        ),

        hasMore:
          page * limit < total,
      },
    });

  } catch (err) {

    console.error(
      'GET POSTS ERROR:',
      err.message
    );

    res.status(500).json({

      success: false,

      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────
// GET SINGLE POST
// GET /api/posts/:id
// ─────────────────────────────────────────────

exports.getPost = async (
  req,
  res
) => {

  try {

    const post =
      await populatePost(

        Post.findOne({

          _id: req.params.id,

          isDeleted: false,
        })
      );


    if (!post) {

      return res.status(404).json({

        success: false,

        message: 'Post not found',
      });
    }


    res.json({

      success: true,

      post,
    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────
// UPDATE POST
// PUT /api/posts/:id
// ─────────────────────────────────────────────

exports.updatePost = async (
  req,
  res
) => {

  try {

    const post =
      await Post.findById(
        req.params.id
      );


    if (!post) {

      return res.status(404).json({

        success: false,

        message: 'Post not found',
      });
    }


    if (
      post.user.toString() !==
      req.user._id.toString()
    ) {

      return res.status(403).json({

        success: false,

        message: 'Unauthorized',
      });
    }


    const {
      caption,
      tags,
    } = req.body;


    if (caption !== undefined) {

      post.caption = caption;
    }


    if (tags !== undefined) {

      post.tags = tags

        .split(',')

        .map((t) =>

          t
            .trim()
            .replace(/^#/, '')
            .toLowerCase()
        )

        .filter(Boolean);
    }


    // CLOUDINARY IMAGE
    if (req.file) {

      post.image =
        req.file.path;
    }


    await post.save();


    const updated =
      await populatePost(
        Post.findById(post._id)
      );


    res.json({

      success: true,

      post: updated,
    });

  } catch (err) {

    console.error(
      'UPDATE POST ERROR:',
      err.message
    );

    res.status(500).json({

      success: false,

      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────
// DELETE POST
// ─────────────────────────────────────────────

exports.deletePost = async (
  req,
  res
) => {

  try {

    const post =
      await Post.findById(
        req.params.id
      );


    if (!post) {

      return res.status(404).json({

        success: false,

        message: 'Post not found',
      });
    }


    const isOwner =
      post.user.toString() ===
      req.user._id.toString();


    if (
      !isOwner &&
      req.user.role !== 'admin'
    ) {

      return res.status(403).json({

        success: false,

        message: 'Unauthorized',
      });
    }


    post.isDeleted = true;

    await post.save();


    res.json({

      success: true,

      message: 'Post deleted',
    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────
// LIKE POST
// ─────────────────────────────────────────────

exports.toggleLike = async (
  req,
  res
) => {

  try {

    const post =
      await Post.findById(
        req.params.id
      );


    if (!post) {

      return res.status(404).json({

        success: false,

        message: 'Post not found',
      });
    }


    const liked =
      post.likes
        .map(String)
        .includes(
          req.user._id.toString()
        );


    if (liked) {

      post.likes.pull(
        req.user._id
      );

    } else {

      post.likes.addToSet(
        req.user._id
      );
    }


    await post.save();


    res.json({

      success: true,

      isLiked: !liked,

      likesCount:
        post.likes.length,
    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,
    });
  }
};


// ─────────────────────────────────────────────
// SHARE POST
// ─────────────────────────────────────────────

exports.sharePost = async (
  req,
  res
) => {

  try {

    const post =
      await Post.findByIdAndUpdate(

        req.params.id,

        {
          $inc: {
            shares: 1,
          },
        },

        {
          new: true,
        }
      );


    if (!post) {

      return res.status(404).json({

        success: false,

        message: 'Post not found',
      });
    }


    res.json({

      success: true,

      shares: post.shares,
    });

  } catch (err) {

    res.status(500).json({

      success: false,

      message: err.message,
    });
  }
};