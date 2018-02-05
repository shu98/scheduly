$( function() {

    var availableTags = [
      "priority high",
      "priority relatively high",
      "priority medium",
      "priority low",
      "reminder tomorrow",
      "on hold",
      "pending tasks",
      "incomplete tasks"
      "complete tasks",
      "repeated tasks",
      "weekly tasks",
      "tasks with dependencies"
    ];
    $( "#searchtasks" ).autocomplete({
      source: availableTags
    });
  } );