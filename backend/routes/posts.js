const router = require('express').Router();
const ctrl   = require('../controllers/postController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/',    protect, upload.single('image'), ctrl.createPost);
router.get('/',     protect, ctrl.getPosts);
router.get('/:id',  protect, ctrl.getPost);
router.put('/:id',  protect, upload.single('image'), ctrl.updatePost);
router.delete('/:id', protect, ctrl.deletePost);

router.post('/like/:id',  protect, ctrl.toggleLike);
router.post('/share/:id', protect, ctrl.sharePost);

router.post('/comment/:postId',       protect, ctrl.addComment);
router.put('/comment/:commentId',     protect, ctrl.editComment);
router.delete('/comment/:commentId',  protect, ctrl.deleteComment);
router.post('/comment/:commentId/reply', protect, ctrl.addReply);

module.exports = router;
