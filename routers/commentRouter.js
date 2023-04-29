const router = require('express').Router();
const isAuthenticated = require('../middleware/auth');
const commentCtrl = require('../controllers/commentCtrl');

router.post('/comment', isAuthenticated, commentCtrl.createComment);
router.patch('/comment/:id', isAuthenticated, commentCtrl.updateComment);
router.patch('/comment/:id/like', isAuthenticated, commentCtrl.likeComment);
router.patch('/comment/:id/unlike', isAuthenticated, commentCtrl.unlikeComment);
router.delete('/comment/:id', isAuthenticated, commentCtrl.deleteComment);

module.exports = router;