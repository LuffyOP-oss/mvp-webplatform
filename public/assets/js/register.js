//Register function
$('#registration_form').submit(function( event ) {
    var firstname   = $('#firstname').val();
    var lastname    = $('#lastname').val();
    var email       = $('#email').val();
    var password    = $('#password').val();
    var day         = $('#day').val();
    var month       = $('#month').val();
    var year        = $('#year').val();
    var sex         = $("input[name='sex']:checked").val()
    var city        = $('#city').val();
    var country     = $('#country').val();

    if(firstname === undefined || lastname === undefined || email === undefined || password === undefined || day === undefined || month === undefined || year === undefined || sex === undefined || city === undefined || country === undefined){
    }else{
        $.ajax({
            url : apihost+"/register",
            type : "POST",
            dataType:"text",
            data : {
                firstname:  firstname,
                lastname:   lastname,
                email:      email,
                password:   password,
                day:        day,
                month:      month,
                year:       year,
                sex:        sex,
                city:       city,
                country:    country
            },
            success : function (result){
                result = JSON.parse(result);
               if(result['success']){
                    window.location.href="/reg-success";
               }else{
                    $('.error-text').html(result['message']);
                    console.log(result['message']);
               }
            }
        });
    }
});

