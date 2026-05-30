const router =
  require('express').Router();

const ctrl =
  require('../controllers/postController');

const {
  protect,
} = require('../middleware/auth');

const upload =
  require('../middleware/upload');


// ─────────────────────────────────────────────
// Posts
// ─────────────────────────────────────────────

router.post(

  '/',

  protect,

  upload.single('image'),

  ctrl.createPost
);


router.get(

  '/',

  protect,

  ctrl.getPosts
);


router.get(

  '/:id',

  protect,

  ctrl.getPost
);


router.put(

  '/:id',

  protect,

  upload.single('image'),

  ctrl.updatePost
);


router.delete(

  '/:id',

  protect,

  ctrl.deletePost
);


// ─────────────────────────────────────────────
// Likes & Shares
// ─────────────────────────────────────────────

router.post(

  '/like/:id',

  protect,

  ctrl.toggleLike
);


router.post(

  '/share/:id',

  protect,

  ctrl.sharePost
);


module.exports = router;