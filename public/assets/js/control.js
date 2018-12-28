$('.icon-menu').click(function(){
    
    if($(this).hasClass('open')){
        $('.icon-menu').removeClass('open');
    }else{
        $('.icon-menu').removeClass('open');
        $(this).addClass('open');
    }
})