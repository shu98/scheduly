var express = require('express');
var router = express.Router();
var passport = require('passport');
var user_controller = require('../controllers/userController');

router.get('/login', user_controller.login_get);

router.post('/login',
        passport.authenticate('local', { successRedirect: '/',
            failureRedirect: '/users/login',
            failureFlash: false })
        );

// router.post('/login', user_controller.login_post);

// router.get('/', user_controller.index_get);

router.get('/signup', user_controller.signup_get);

router.get('/signup/error', user_controller.signup_error);

router.post('/signup', user_controller.signup_post);

router.get('/logout', user_controller.logout_get);

module.exports = router;
