var passport = require('passport');
var User = require('../models/user');

exports.login_get = function (req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/');
    }
    else {
        // res.redirect('/welcome')
        res.render('login');
    }
    
};


exports.signup_get = function (req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/');
    }
    else {
        res.render('signup');
    }
};

exports.signup_error = function (req, res, next) {
    if(req.isAuthenticated()) {
        res.redirect('/');
    }
    else {
        res.render('signup_error');
    }
};


exports.signup_post = function (req, res, next) {

    User.findOne({'username': req.body.username})
        .exec(function(err, found_user) {
            if (found_user) {
                res.redirect('/users/signup/error');
            }

            else {

                req.checkBody('username', 'Please enter a valid username').notEmpty();
                req.checkBody('password').isLength({min: 1});
                req.checkBody('email', 'Please enter a valid email address').isEmail();
                req.checkBody('first_name').notEmpty();
                req.checkBody('last_name').notEmpty();

                req.sanitize('username').escape().trim();
                req.sanitize('password').escape().trim();
                req.sanitize('first_name').escape().trim();
                req.sanitize('last_name').escape().trim();
                req.sanitize('email').escape().trim();

                new_user = new User({
                    username: req.body.username,
                    email: req.body.email==='' ? 'default@gmail.com' : req.body.email,
                    password: '',
                    first_name: req.body.first_name,
                    first_name: req.body.last_name
                });

                User.register(new_user, req.body.password, function(err, account) {
                    if (err) {
                        console.log("error", err);
                        return res.redirect('/users/signup/error');
                    }
                    passport.authenticate('local')(req, res, function () {
                        res.redirect('/');
                    });
                    // req.login(new_user, function(err) {
                    //     if (err) {
                    //         console.log("error")
                    //         return res.redirect('/users/signup');
                    //     }
                    //     return res.direct('/');
                    // })
                });

                // res.redirect('/welcome');

            }
        })

    
};

exports.logout_get = function(req, res) {
    req.logout();
    res.redirect('/welcome');
}