exports.isUser = function(req, res, next){
    if(req.isAuthenticated())
        next();
    else{
        req.flash('danger', 'you must be logged in');
        req.redirect('/users/login');
    }
}

exports.isAdmin = function(req, res, next){
    if(req.isAuthenticated() && res.locals.user.admin == 1)
        next();
    else{
        req.flash('danger', 'please login as admin');
        req.redirect('/users/login');
    }
}