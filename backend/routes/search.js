const router = require('express').Router();
const ctrl   = require('../controllers/searchController');
const { protect } = require('../middleware/auth');

router.get('/',        protect, ctrl.search);
router.get('/tag/:tag', protect, ctrl.getByTag);

module.exports = router;
