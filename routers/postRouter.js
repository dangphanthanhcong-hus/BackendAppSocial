const router = require('express').Router();
const isAuthenticated = require('../middleware/auth');
const postCtrl = require('../controllers/postCtrl');

router.route('/posts')
    .post(isAuthenticated, postCtrl.createPost)
    .get(isAuthenticated, postCtrl.getFeedPosts);
router.route('/post/:id')
    .get(isAuthenticated, postCtrl.getPost)
    .patch(isAuthenticated, postCtrl.updatePost)
    .delete(isAuthenticated, postCtrl.deletePost);
router.patch('/post/:id/like', isAuthenticated, postCtrl.likePost);
router.patch('/post/:id/unlike', isAuthenticated, postCtrl.unlikePost);
router.get('/posts_user/:id', isAuthenticated, postCtrl.getUserPosts);
router.get('/posts_discover', isAuthenticated, postCtrl.getDiscoverPost);

module.exports = router;