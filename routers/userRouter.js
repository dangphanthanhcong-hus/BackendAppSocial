const router = require('express').Router();
const isAuthenticated = require('../middleware/auth');
const userCtrl = require('../controllers/userCtrl');

router.get('/search', isAuthenticated, userCtrl.searchUser);
router.get('/user/:id', isAuthenticated, userCtrl.getUser);
router.patch('/user', isAuthenticated, userCtrl.updateUser);
router.patch('/avatar', isAuthenticated, userCtrl.updateAvatar);
router.patch('/user/:id/follow', isAuthenticated, userCtrl.follow);
router.patch('/user/:id/unfollow', isAuthenticated, userCtrl.unfollow);

module.exports = router;