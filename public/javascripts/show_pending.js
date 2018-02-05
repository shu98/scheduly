
// https://stackoverflow.com/questions/15566999/how-to-show-form-input-fields-based-on-select-value

$('#status').on('change',function(){
    var selection = $(this).val();
    switch(selection){
    case "pending":
        $("#forPending").show()
        $("#forPending2").show()
        $("#forPending3").show()
        // $("#forPending4").hide()
        break;
    // case "repeated":
    //     $("#forPending").hide()
    //     $("#forPending2").hide()
    //     $("#forPending3").show()
    //     // $("#forPending4").show()
    //     break;
    default:
        $("#forPending").hide()
        $("#forPending2").hide()
        $("#forPending3").hide()
        // $("#forPending4").hide()
    }
});