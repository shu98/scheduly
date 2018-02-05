var i = 0;
var original = document.getElementById('copy');

function addDep(task_name){
     
    var clone = original.cloneNode(true);

    clone.removeAttribute('id');
    clone.firstChild.id = 'dependency' + ++i;
    clone.classList.remove('hide');
    clone.firstChild.value = task_name;

    clone.lastChild.innerHTML = clone.lastChild.innerHTML + task_name;

    console.log(clone.lastChild.innerHTML);

    // for (j = 0; j < 5; j++) {
    //     clone.childNodes[1].lastChild.childNodes[j].setAttribute("name", 'site_rating[' + i + ']');
    //     clone.childNodes[1].lastChild.childNodes[j].firstElementChild.setAttribute("name", 'site_rating[' + i + ']');
    // }

    original.parentNode.insertBefore(clone, original);
     
}


// $(document).keypress(function(e) {
//     if(e.which == 13) { 
//         e.preventDefault();
//         var task_name = $('#taskname').val();
//         if (task_name.length > 0) {
//             addDep(task_name);
//             $('#taskname').val('');
//         }
        
//     }
// });

// $('.add-dep').click(function() {
    
//     var task_name = $('#taskname').val();
//     if (task_name.length > 0) {
//         addDep(task_name);
//         $('#taskname').val('');
//     }
        
    
// });

$("input#taskname").keypress(function(event) {
    if (event.which == 13) {
        event.preventDefault();
        if ($('input#taskname:text').val().length > 0) {
            // $("#formTask").submit();
            var content = $('input#taskname:text').val();
            $('#task_name:text').val(content);
            $('input#taskname:text').val('');
            $('#createtask').modal('show');
        }
    }
});

$("#initial_dep").on("click", function(event) {
    if ($('input#taskname:text').val().length > 0) {
            var content = $('input#taskname:text').val();
            $('#task_name:text').val(content);
            $('input#taskname:text').val('');
        }
})

$('#dependencybutton').click(function() {
    $('#reminderform').submit();
})

