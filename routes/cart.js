var express = require('express');
var fs = require('fs-extra');
var router = express.Router();
var Product = require('../models/product');

router.get('/add/:product', function(req, res){
    var slug = req.params.product;
    Product.findOne({slug:slug}, function(err,product){
        if(err)
            console.log(err);
        if(typeof req.session.cart === "undefined"){
            req.session.cart = [];
            req.session.cart.push({
                title : slug,
                qty:1,
                price : parseFloat(product.price).toFixed(2),
                image : '/product_images/' + product.id + '/' + product.image
            });
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for(var i=0;i< cart.length; i++){
                if(cart[i].title == slug){
                    cart[i].qty ++;
                    newItem = !newItem;
                    break;
                }
            }
            if(newItem){
                cart.push({
                    title : slug,
                    qty:1,
                    price : parseFloat(product.price).toFixed(2),
                    image : '/product_images/' + product.id + '/' + product.image
                })
            }
        }
        req.flash("success", "product added to cart")
        res.redirect("back");
    })
});


router.get('/checkout', function(req, res){
    if(req.session.cart && req.session.cart.length == 0){
        delete req.session.cart;
        res.redirect('/cart/checkout');
    }
    else{
        res.render('checkout', {
            title : 'Checkout', 
            cart : req.session.cart
        })
    }
    
})

router.get('/update/:product', function(req, res){
    var slug = req.params.product;
    var cart = req.session.cart;
    var action = req.query.action;

    for(var i=0; i< cart.length; i++){
        if(cart[i].title == slug){
            switch(action){
                case "add":
                    cart[i].qty ++;
                    break;
                case "remove":
                    cart[i].qty--;
                    if(cart[i].qty < 1)
                    cart.splice(i,1);
                    break;
                case "clear":
                    cart.splice(i,1);
                    if(cart.length == 0)
                    delete req.session.cart;
                    break;
                default:
                    console.log("update issue");
                
            }
            break;
        }
    }
    req.flash('success', "cart updated");
    res.redirect("/cart/checkout");
    
})

router.get('/clear', function(req, res){
    delete req.session.cart;
    req.flash('success', 'cart cleared');
    res.redirect('/cart/checkout');
})
module.exports = router;