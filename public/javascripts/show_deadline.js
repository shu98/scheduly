$('#overdue_choice').on('change',function(){
    var selection = $(this).val();
    switch(selection){
    case "new_deadline":
        $("#deadline_group").show()
        break;
    default:
        $("#deadline_group").hide()
    }
});