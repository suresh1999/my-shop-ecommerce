var express = require('express');
var router = express.Router();

var Page = require('../models/pages');

router.get('/', function(req, res){
    Page.find({}).sort({sorting:1}).exec(function(err, pages){
        res.render('admin/pages',{
            pages:pages
        })
    });
});
router.get('/add-page', function(req, res){
    var title = "";
    var slug = "";
    var content = "";

    res.render('admin/add_page',{
        title : title,
        slug : slug,
        content : content
    });
});

router.post('/add-page', function(req, res){
    
    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('content', 'content must have a value').notEmpty();

    var title = req.body.title;
    var slug  = req.body.slug;
    
    if(slug==""){
        slug = title.replace(/\s+/g,'-').toLowerCase();
    }else{
        if(title){
            slug  = title.replace(/\s+/g,'-').toLowerCase();
        }
    }
    var content = req.body.content;

    var errors = req.validationErrors();
    if (errors)
        res.render('admin/add_page',{
            title : title,
            slug : slug,
            content : content,
            errors : errors
        });
    else{
        Page.findOne({slug:slug}, function(err, page){
            if(page){
                req.flash('danger', 'page slug already exists. Choose different one');
                res.render('admin/add_page',{
                    title : title,
                    slug : slug,
                    content : content,
                });
            }else{
                var page = new Page({
                    title : title,
                    slug:slug,
                    content:content,
                    sorting :100
                });
                page.save(function(err){
                    if(err) return console.log(err);
                    else{
                        Page.find({}).sort({sorting:1}).exec(function(err, pages){
                            if(err) console.log(err);
                            else
                                req.app.locals.pages = pages;
                        });
                        req.flash('success', 'page created successfully');
                        res.redirect('/admin/pages');
                    }
                });
            }
        })
    }
});

function sortPages(ids, callback){
    var count = 0;
    for(var i=0;i< ids.length; i++){
        var id = ids[i];
        count ++;
        (function(count){
            Page.findById(id, function(err, page){
                page.sorting = count-1;
                page.save(function(err){
                    if(err)
                        console.log(err);
                })
                if(count >= ids.length)
                    callback();
            });
        })(count);
    }
}
router.post('/reorder-pages', function(req, res){
    var ids = req.body['id[]'];
    sortPages(ids, function(){
        Page.find({}).sort({sorting:1}).exec(function(err, pages){
            if(err) console.log(err);
            else
                req.app.locals.pages = pages;
        });
    })
    

});

router.get('/edit-page/:id', function(req, res){
    Page.findById(req.params.id, function(err, page){
        if(err)
            console.log(err);
        else
            res.render('admin/edit_page',{
                title : page.title,
                slug : page.slug,
                content : page.content,
                id : page._id
            });
    })
});
router.post('/edit-page/:id', function(req, res){
    
    req.checkBody('title', 'title must have a value').notEmpty();
    req.checkBody('content', 'content must have a value').notEmpty();

    var title = req.body.title;
    var slug  = req.body.slug;
    
    if(slug==""){
        slug = title.replace(/\s+/g,'-').toLowerCase();
    }else{
        if(title){
            slug  = title.replace(/\s+/g,'-').toLowerCase();
        }
    }
    var content = req.body.content;
    var id = req.params.id;
    var errors = req.validationErrors();
    if (errors)
        res.render('admin/edit_page',{
            title : title,
            slug : slug,
            content : content,
            errors : errors,
            id:id

        });
    else{
        Page.findOne({slug:slug, _id:{'$ne':id}}, function(err, page){
            if(page){
                req.flash('danger', 'page slug already exists. Choose different one');
                res.render('admin/edit_page',{
                    title : title,
                    slug : slug,
                    content : content,
                    id:id
                });
            }else{
                Page.findById(id, function(err, page){
                    page.content = content;
                    page.slug = slug;
                    page.title = title;
                    page.save(function(err){
                        if(err) return console.log(err);
                        else{
                            Page.find({}).sort({sorting:1}).exec(function(err, pages){
                                if(err) console.log(err);
                                else
                                    req.app.locals.pages = pages;
                            });
                            req.flash('success', 'page edited successfully');
                            res.redirect(`/admin/pages/edit-page/${id}`);
                        }
                    });
                })
                
            }
        })
    }
});

router.get('/delete-page/:id', function(req, res){
    Page.findByIdAndRemove(req.params.id, function(err){
        if(err) console.log(err);
        Page.find({}).sort({sorting:1}).exec(function(err, pages){
            if(err) console.log(err);
            else
                req.app.locals.pages = pages;
        });
        req.flash('success', 'page successfully deleted');
        res.redirect('/admin/pages');
    })
})
module.exports = router;