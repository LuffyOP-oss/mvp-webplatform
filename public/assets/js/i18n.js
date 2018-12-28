$( document ).ready(function() {
    $( ".i18n" ).each(function() {
        $(this).html($(this).html().replace(/&gt;/g,'>').replace(/&lt;/g,'<'))
      });
    //i18n.each((index) => {
        //$(this).html($(this).html().replace(/&gt;/g,'>').replace(/&lt;/g,'<'))
        
    //});
});