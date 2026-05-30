const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);   // all admin routes require auth + admin role

router.get('/stats',                  ctrl.getStats);
router.get('/users',                  ctrl.getAllUsers);
router.put('/users/:id/toggle-status', ctrl.toggleUserStatus);
router.get('/posts',                  ctrl.getAllPosts);
router.delete('/posts/:id',           ctrl.hardDeletePost);

module.exports = router;
