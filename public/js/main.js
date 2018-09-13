$(function(){
    if($('textarea#my').length)
        CKEDITOR.replace('my');

    if($("[data-fancybox]").length){
        $("[data-fancybox]").fancybox();
    }
});