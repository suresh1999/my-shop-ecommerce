var express = require('express');
var path = require('path');
var mongoose = require('mongoose');
var config = require('./config/database');
var bodyParser = require('body-parser');
var session = require('express-session');
var expressValidator = require('express-validator');
var fileUpload = require('express-fileupload');
var passport = require('passport');
// database configuration
mongoose.connect('mongodb://suresh1999:tester123@ds257372.mlab.com:57372/ecommerce');
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
db.once('open', function () {
    console.log('connected to mongoDB');
})
var app = express();
var auth = require('./config/auth')

app.locals.errors = null;

var Page = require('./models/pages');
Page.find({}).sort({sorting:1}).exec(function(err, pages){
    if(err) console.log(err);
    else
        app.locals.pages = pages;
});

app.locals.errors = null;

var Category = require('./models/category');
Category.find({}).sort({sorting:1}).exec(function(err, categories){
    if(err) console.log(err);
    else
        app.locals.categories = categories;
});

app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname,'public')));
app.use(fileUpload());
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());
app.use(session({
    secret:'ksdsdsdsa',
    resave:true,
    saveUninitialized:true,
    // cookie:{secure:true}
}));

app.use(expressValidator({
    errorFormatter:function(param, msg, val){
        var namespace = param.split('.')
            , root = namespace.shift()
            , formParam = root;
        while(namespace.length){
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param : formParam,
            msg : msg,
            value : val
        };
    },
    customValidators : {
        isImage : function (value, filename){
            var extension = (path.extname(filename)).toLowerCase();
            switch(extension){
                case ".jpg":
                    return ".jpg";
                case ".png":
                    return ".png";
                case ".jpeg":
                    return ".jpeg";
                case "":
                    return ".jpg";
                default:
                    return false;
            }
        }
    }
}));

app.use(require('connect-flash')());
app.use(function(req, res, next){
    res.locals.messages = require('express-messages')(req,res);
    next();
})
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.get('*', function(req, res, next){
    res.locals.cart = req.session.cart;
    res.locals.user = req.user || null;
    next();
})
const index = require('./routes/index');
const adminPages = require('./routes/admin_pages');
const adminCategories = require('./routes/admin_categories');
const adminProducts = require('./routes/admin_products');
const products = require('./routes/products');
const cart = require('./routes/cart');
const users = require('./routes/user');

app.use('/admin/pages', adminPages);
app.use('/admin/categories',adminCategories);
app.use('/admin/products', adminProducts);
app.use('/products', products);
app.use('/cart', cart);
app.use('/users', users);

app.use('/', index);
let port = process.env.PORT || 8080;

app.listen(port, function(){
    console.log(`successfully started server on port ${port}`);
});