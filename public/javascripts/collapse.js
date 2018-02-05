// $(".task-collapse").click(function () {

//     $header = $(this);

//     $content = $header.next();
    
//     $content.slideToggle(350, function () {

//         $header.text(function () {
            
            
//         });
//     });
// });


$(".task-collapse").click(function () {

    var $x = $('.task-collapse');
	var $content = $x.eq($x.index(this) + 1);
    
    $content.slideToggle(350, function () {

        $x.text(function () {
            
            
        });
    });
});