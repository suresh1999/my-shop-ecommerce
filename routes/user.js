var express = require('express');

var router = express.Router();
var passport = require('passport');
var bcrypt = require('bcryptjs');
var User = require('../models/user')

router.get('/register', function(req, res){
    res.render('register', {
        title: 'Register'
    })
});

router.post('/register', function(req, res){
    // console.log("jsdsd")
    var name = req.body.name;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var password2 = req.body.password2;
    req.checkBody('name','Name is required').notEmpty();
    req.checkBody('email','Email is required').notEmpty();
    req.checkBody('username','Username is required').notEmpty();

    req.checkBody('password','Password is required').notEmpty();
    req.checkBody('password2','Passwords donot match').equals(password);

    var errors = req.validationErrors();
    //
    if(errors){
        res.render('register', {
            title: 'Register',
            user:null,
            errors:errors
        })
    }else{
        User.findOne({username:username}, function(err, user){
            if(err)
                console.log(err);
            if(user){
                req.flash('danger', 'User exists, choose another');
                res.redirect('/users/register');
            } else {
                var user = new User({
                    name : name,
                    email : email,
                    username : username,
                    password : password,
                    admin:0
                });
                bcrypt.genSalt(10,function (err, salt){
                    bcrypt.hash(user.password, salt, function(err, hash){
                        if(err)
                            console.log(err);
                        user.password = hash;
                        user.save(function(err){
                            if(err){
                                console.log(err);
                            } else {
                                req.flash('success', 'you are successfully registered');
                                res.redirect('/users/login');
                            }
                        });
                    })
                })
            }
        })
    }

});

router.get('/login', function(req, res){
    if(res.locals.user) res.redirect('/')

    res.render('login', {
        title : 'login'
    })
})
router.post('/login', function(req, res, next){
    
    if(res.locals.user) res.redirect('/')

    passport.authenticate('local',{
        successRedirect : '/',
        failureRedirect : '/users/login',
        failureFlash : true
    })(req,res,next);
})
router.get('/logout', function(req, res){
    req.logout();
    req.flash('success', 'you are logged out');
    res.redirect('/users/login');

})
module.exports = router;