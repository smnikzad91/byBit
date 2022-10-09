const { Router } = require('express')
const router = Router();
const authController = require('./../controllers/authController');
const csrf = require('csurf')
const bodyParser = require('body-parser');
var parseForm = bodyParser.urlencoded({ extended: false });
const csrfProtection = csrf({ cookie: true })

router.get('/auth/register', authController.registerGet)
router.post('/auth/register', authController.registerPost);
router.get('/auth/login', csrfProtection, authController.loginGet)
router.post('/auth/login',  authController.loginPost)
router.get('/auth/logout', authController.logoutGet)

module.exports = router;