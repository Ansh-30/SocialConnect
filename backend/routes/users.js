const router = require('express').Router();
const ctrl   = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Must come before /:id to avoid being matched
router.get('/suggestions',  protect, ctrl.getSuggestions);
router.get('/saved-posts',  protect, ctrl.getSavedPosts);
router.get('/by-username/:username', ctrl.getUserByUsername);

router.put('/profile', protect, upload.single('avatar'), ctrl.updateProfile);
router.post('/follow/:id', protect, ctrl.toggleFollow);
router.post('/save/:postId', protect, ctrl.toggleSave);

router.get('/:id',       ctrl.getUserById);
router.get('/:id/posts', ctrl.getUserPosts);

module.exports = router;
