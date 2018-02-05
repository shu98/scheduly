$('#repeat').on('change',function(){
    var selection = $(this).val();
    switch(selection){
    case "never":
        $("#forRepeat").hide()
        $("#forRepeat2").hide()
        break;
    default:
        $("#forRepeat").show()
        $("#forRepeat2").show()
    }
});