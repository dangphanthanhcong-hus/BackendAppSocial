const router = require('express').Router();
const isAuthenticated = require('../middleware/auth');
const authCtrl = require('../controllers/authCtrl');

router.post('/register', authCtrl.register);
router.post('/register_admin', authCtrl.registerAdmin);
router.post('/changePassword', isAuthenticated, authCtrl.changePassword);
router.post('/login', authCtrl.login);
router.post('/login_admin', authCtrl.loginAdmin);
router.post('/logout', authCtrl.logout);
router.post('/refresh_token', authCtrl.generateAccessToken);

module.exports = router;