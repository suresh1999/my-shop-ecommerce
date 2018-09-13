var express = require('express');
var router = express.Router();

var Page = require('../models/pages');
var Category = require('../models/category');

router.get('/', function(req, res){
    Category.find(function(err, categories){
        if(err) console.log(err);
        res.render('admin/categories',{
            categories : categories
        })
    });
});
router.get('/add-category', function(req, res){
    var title = "";
    var slug = "";

    res.render('admin/add_category',{
        title : title,
        slug : slug,
    });
});

router.post('/add-category', function(req, res){
    
    req.checkBody('title', 'title must have a value').notEmpty();
    var title = req.body.title;
    var slug = title.replace(/\s+/g,'-').toLowerCase();

    var errors = req.validationErrors();
    if (errors)
        res.render('admin/add_category',{
            title : title,
            errors : errors
        });
    else{
        Category.findOne({slug:slug}, function(err, category){
            if(category){
                req.flash('danger', 'category slug already exists. Choose different one');
                res.render('admin/add_category',{
                    title : title,
                });
            }else{
                var category = new Category({
                    title : title,
                    slug:slug,
                });
                category.save(function(err){
                    if(err) return console.log(err);
                    else{
                        Category.find({}).sort({sorting:1}).exec(function(err, categories){
                            if(err) console.log(err);
                            else
                                req.app.locals.categories = categories;
                        });
                        req.flash('success', 'category created successfully');
                        res.redirect('/admin/categories');
                    }
                });
            }
        })
    }
});

router.get('/edit-category/:id', function(req, res){
    Category.findById(req.params.id, function(err, cat){
        if(err)
            console.log(err);
        else
            res.render('admin/edit_category',{
                title : cat.title,
                id : cat._id
            });
    })
});
router.post('/edit-category/:id', function(req, res){
    
    req.checkBody('title', 'title must have a value').notEmpty();

    var title = req.body.title;
    var slug  = title.replace(/\s+/g,'-').toLowerCase();
    
    
    var id = req.params.id;
    var errors = req.validationErrors();
    if (errors)
        res.render('admin/edit_category',{
            title : title,
            errors : errors,
            id:id

        });
    else{
        Category.findOne({slug:slug, _id:{'$ne':id}}, function(err, cat){
            if(cat){
                req.flash('danger', 'Category yitle already exists. Choose different one');
                res.render('admin/edit_category',{
                    title : title,
                    id:id
                });
            }else{
                Category.findById(id, function(err, cat){
                    cat.slug = slug;
                    cat.title = title;
                    cat.save(function(err){
                        if(err) return console.log(err);
                        else{
                            Category.find({}).sort({sorting:1}).exec(function(err, categories){
                                if(err) console.log(err);
                                else
                                    req.app.locals.categories = categories;
                            });
                            req.flash('success', 'category edited successfully');
                            res.redirect(`/admin/categories/edit-category/${id}`);
                        }
                    });
                })
                
            }
        })
    }
});

router.get('/delete-category/:id', function(req, res){
    Category.findByIdAndRemove(req.params.id, function(err){
        if(err) console.log(err);
        Category.find({}).sort({sorting:1}).exec(function(err, categories){
            if(err) console.log(err);
            else
                req.app.locals.categories = categories;
        });
        req.flash('success', 'page successfully deleted');
        res.redirect('/admin/categories');
    })
})
module.exports = router;