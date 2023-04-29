const router = require('express').Router();
const isAuthenticated = require('../middleware/auth');
const notificationCtrl = require('../controllers/notificationCtrl');

router.post('/notification', isAuthenticated, notificationCtrl.createNotification);
router.get('/notifications', isAuthenticated, notificationCtrl.getAllNotification);
router.patch('/readNotification/:id', isAuthenticated, notificationCtrl.readNotification);
router.delete('/notification/:id', isAuthenticated, notificationCtrl.deleteNotification);
router.delete('/notifications', isAuthenticated, notificationCtrl.deleteAllNotification);

module.exports = router;