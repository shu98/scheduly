$('#unit_of_time').on('change',function(){
    var selection = $(this).val();
    switch(selection){
    case "day":
        $("#forRepeat2").hide()
        break;
    case "month":
        $("#forRepeat2").hide()
        break;
    case "year":
        $("#forRepeat2").hide()
        break;
    default:
        $("#forRepeat2").show()
        break;
    }
});