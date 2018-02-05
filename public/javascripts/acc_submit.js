$("input#answer").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        if ($('input#answer:text').val().length > 0) {
            $("#formAcc").submit();
        }
    }
});