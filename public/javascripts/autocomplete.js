$(function(){

    var options = [
        {value: 'priority high'},
        {value: 'priority relatively high'},
        {value: 'priority medium'},
        {value: 'priority low'},
        {value: 'priority none'},
        {value: 'priority 1'},
        {value: 'priority 2'},
        {value: 'priority 3'},
        {value: 'priority 4'},
        {value: 'priority 5'},
        {value: 'priority 6'},
        {value: 'priority 7'},
        {value: 'priority 8'},
        {value: 'priority 9'},
        {value: 'priority 10'},
        {value: 'reminder'},
        {value: 'reminder tomorrow'},
        {value: 'on hold tasks'},
        {value: 'incomplete tasks'},
        {value: 'complete tasks'},
        {value: 'repeated tasks'},
        {value: 'daily tasks'},
        {value: 'weekly tasks'},
        {value: 'monthly tasks'},
        {value: 'yearly tasks'},
        {value: 'tasks with dependencies'},
        {value: 'deadline today'},
        {value: 'deadline tomorrow'},
        {value: 'deadline passed'},
        {value: 'due today'},
        {value: 'due tomorrow'},
        {value: 'overdue'}

    ];

    
  
  $('#searchtasks').autocomplete({
    lookup: options,
  });
  

});


// $('.search-tasks').focus(function(){
//         var names;
//         $.ajax({
//             type: 'POST',
//             url: '/tasks/search/tasks',
//             async: false,
//             success: function(data) {
//                 console.log(data);
//                 names = data;
//                 $('#searchtasks').autocomplete({  
//                     data: names,
//                     limit: 20, // The max amount of results that can be shown at once. Default: Infinity.
//                 });
//             }
//         });
//     })

// $(document).ready(function() {

// })