const router = require('express').Router();
const isAuthenticated = require('../middleware/auth');
const adminCtrl = require('../controllers/adminCtrl');

router.get('/get_total_users', isAuthenticated, adminCtrl.getTotalUsers);
router.get('/get_total_posts', isAuthenticated, adminCtrl.getTotalPosts);
router.get('/get_total_comments', isAuthenticated, adminCtrl.getTotalComments);
router.get('/get_total_likes', isAuthenticated, adminCtrl.getTotalLikes);

module.exports = router;