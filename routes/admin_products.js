var express = require('express');
var router = express.Router();
var mkdirp = require('mkdirp');
var fs = require('fs-extra');
var resizeImg = require('resize-img');


var Product = require('../models/product');
var Category = require('../models/category');
router.get('/', function(req, res){
    var count ;
    Product.count(function(err, c){
        count = c;
    });
    Product.find({}, function(err, product){
        res.render('admin/products',{
            products : product,
            count : count
        })
    })
});
router.get('/add-product', function(req, res){
    var title = "";
    var desc = "";
    var price = "";
    Category.find(function(err, categories){
        res.render('admin/add_product',{
            title : title,
            desc : desc,
            price : price,
            categories : categories
        });
    })
    
});

router.post('/add-product', function(req, res){
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('desc', 'description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);

    var title = req.body.title;
    var slug  = title.replace(/\s+/g,'-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;


    var errors = req.validationErrors();
    if (errors)
        Category.find(function(err, categories){
            res.render('admin/add_product',{
                errors : errors,
                title : title,
                desc : desc,
                price : price,
                categories : categories
            });
        });
    else{
        Product.findOne({slug:slug}, function(err, product){
            if(product){
                req.flash('danger', 'product slug already exists. Choose different one');
                Category.find(function(err, categories){
                    res.render('admin/add_product',{
                        errors : errors,
                        title : title,
                        desc : desc,
                        price : price,
                        categories : categories
                    });
                });
            }else{
                var price2 = parseFloat(price).toFixed(2);
                var product = new Product({
                    title : title,
                    slug:slug,
                    desc:desc,
                    price : price2,
                    category:category,
                    image:imageFile
                });
                product.save(function(err){
                    if(err) return console.log(err);
                    
                    else{
                        mkdirp('public/product_images/'+product._id, function(err){
                            console.log(err);
                        });
                        mkdirp('public/product_images/'+product._id+'/gallery', function(err){
                            console.log(err);
                        });
                        mkdirp('public/product_images/'+product._id+'/gallery/thumbs', function(err){
                            console.log(err);
                        });
                        if(imageFile!=""){
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + product._id + '/' + imageFile;
                            productImage.mv(path, function(err){
                                return console.log(err);
                            })
                        }
                        req.flash('success', 'Product added');
                        res.redirect('/admin/products');
                    }
                });
            }
        })
    }
});


router.get('/edit-product/:id', function(req, res){
    var errors;
    if(req.session.errors) errors = req.session.errors;
    req.session.errors = null;
    Category.find(function(err, categories){
        Product.findById(req.params.id, function (err, p){
            if(err){
                console.log(err);
                res.redirect('/admin/products');
            } else{
                var galleryDir = 'public/product_images/' + p._id + '/gallery';
                var galleryImages = null;

                fs.readdir(galleryDir, function(err,files){
                    if(err) console.log(err);
                    else{
                        galleryImages = files;
                        res.render('admin/edit_product',{
                            title : p.title,
                            desc : p.desc,
                            price : parseFloat(p.price).toFixed(2),
                            errors : errors,
                            categories : categories,
                            category:p.category.replace(/\s+/g,'-').toLowerCase(),
                            image : p.image,
                            galleryImages : galleryImages,
                            id:p._id
                        });
                    }
                })
            }
        })
        
    })

});
router.post('/edit-product/:id', function(req, res){
    var imageFile = typeof req.files.image !== "undefined" ? req.files.image.name : "";
    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('desc', 'description must have a value').notEmpty();
    req.checkBody('price', 'Price must have a value').isDecimal();
    req.checkBody('image', 'You must upload an image').isImage(imageFile);
    var id = req.params.id;
    var title = req.body.title;
    var slug  = title.replace(/\s+/g,'-').toLowerCase();
    var desc = req.body.desc;
    var price = req.body.price;
    var category = req.body.category;
    var pimage = req.body.pimage;

    var errors = req.validationErrors();
    if(errors){
        req.session.errors = errors;
        res.redirect('/admin/products/edit-product/'+id);
    }else{
        Product.findOne({slug:slug, _id:{'$ne': id}}, function(err, pro){
            if(err)
                console.log(err);
            if(pro){
                req.flash('danger', 'product title exists choose another one');
                res.redirect('/admin/products/edit-product/'+id);
            } else{
                Product.findById(id, function(err, p){
                    if(err) console.log(err);
                    
                    p.title = title;
                    p.slug = slug;
                    p.desc = desc;
                    p.price = parseFloat(price).toFixed(2);
                    p.category = category;
                    if(imageFile !="")
                        p.image = imageFile;
                    
                    p.save(function(err){
                        if(err) console.log(err);
                        if(imageFile != ""){
                            if(pimage !=""){
                                console.log(pimage)
                                fs.remove('public/product_images/' + id + '/' + pimage, function(err){
                                    if(err)
                                        console.log(err);

                                });
                            }
                            var productImage = req.files.image;
                            var path = 'public/product_images/' + id + '/' + imageFile;
                            productImage.mv(path, function(err){
                                return console.log(err);
                            })
                        }
                        req.flash('success', 'Product added');
                        res.redirect('/admin/products/edit-product/'+id);
                    });
                })
            }
        })
    }
});

router.post('/product-gallery/:id', function(req, res){
    var productImage = req.files.file;
    var id = req.params.id;
    var path = 'public/product_images/' + id +'/gallery/' + req.files.file.name;
    var thumbspath = 'public/product_images/' + id +'/gallery/thumbs/' + req.files.file.name;
    productImage.mv(path, function(err){
        if(err){
            console.log(err);
        }
        resizeImg(fs.readFileSync(path), {width:100, height:100}).then(function(buf){
            fs.writeFileSync(thumbspath, buf);
        });
    });
    res.sendStatus(200);
})

router.get('/delete-image/:image', function(req, res){
    var path = 'public/product_images/' + req.query.id +'/gallery/' + req.params.image;
    var thumbspath = 'public/product_images/' + req.query.id +'/gallery/thumbs/' + req.query.id;
    fs.remove(path, function(err){
        if(err){
            console.log(err);
        } else{
            fs.remove(thumbspath, function(err){
                if(err) console.log(err)
                else{
                    req.flash('success', 'Image Deleted');
                    res.redirect('/admin/products/edit-product/'+req.query.id);
                }
            })
        }
    });
})

router.get('/delete-product/:id', function(req, res){
    var id = req.params.id;
    var path = 'public/product_images/' + id;
    
    fs.remove(path, function(err){
        if(err) console.log(err);
        else{
            Product.findByIdAndRemove(id, function(err){
                if(err) console.log(err);
            });
            req.flash("success", "Product removed");
            res.redirect('/admin/products/');
        }
    })
})
module.exports = router;