// button.btn.btn-primary(type='submit') Submit

$("input#initial_task_name").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        if ($('input#initial_task_name:text').val().length > 0) {
            // $("#formTask").submit();
            var content = $('input#initial_task_name:text').val();
            $('#task_name:text').val(content);
            $('input#initial_task_name:text').val('');
            $('#createtask').modal('show');
        }
    }
});

$("#initial_add_task").on("click", function(event) {
    if ($('input#initial_task_name:text').val().length > 0) {
            var content = $('input#initial_task_name:text').val();
            $('#task_name:text').val(content);
            $('input#initial_task_name:text').val('');
        }
})
