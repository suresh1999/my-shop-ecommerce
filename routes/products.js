var express = require('express');
var fs = require('fs-extra');
var router = express.Router();
var Product = require('../models/product');
var Category = require('../models/category');
router.get('/', function(req, res){
    Product.find(function(err, products){
        if(err) console.log(err)
        res.render('all_products', {
            title : "All products",
            products: products
        })
    })
});

router.get('/:category', function(req, res){

    var cslug = req.params.category;
    Category.find({slug:cslug}, function(err, category){
        if(err) console.log(err);
        else{
            Product.find({category:cslug},function(err, products){
                if(err) console.log(err)
                res.render('all_products', {
                    title : products.title,
                    products: products
                })
            })
        }
    })
    
});

router.get('/:category/:product', function(req, res){

    var galleryImages = null;
    Product.findOne({slug:req.params.product}, function (err, p) {
        if(err) console.log(err);
        else{
            var galleryDir = './public/product_images/' + p._id + '/gallery';
            
            fs.readdir(galleryDir, function(err, files){
                if(err) console.log(err);
                else{
                    galleryImages = files;
                    res.render('product',{
                        title : p.title,
                        p : p,
                        galleryImages : galleryImages
                    });
                }
            }) 
        }
    })
});


module.exports = router;