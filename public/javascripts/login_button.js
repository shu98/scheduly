$('#loginform').keyup(function() {
    if ($('#username').val().length > 0 && $('#password').val().length > 0) {
        $('#loginbutton').removeClass('btn-primary-initial');
    }
    else {
        $('#loginbutton').addClass('btn-primary-initial');
    }
})

$('#signupform').keyup(function() {
    if ($('#username1').val().length > 0 && $('#password1').val().length > 0 
            && $('#first_name').val().length > 0 && $('#last_name').val().length > 0
            && $('#email').val().length > 0) {

        $('#signupbutton').removeClass('btn-primary-initial');
    }
    
    else {
        $('#signupbutton').addClass('btn-primary-initial');
    }
})

