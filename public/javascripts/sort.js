function sortList() {
    console.log("hello")
    var list, i, switching, b, shouldSwitch;
    list = document.getElementById("taskList");

    switching = true;
  
    while (switching) {

        switching = false;
        b = list.getElementsByTagName("li");

        console.log(b[0].innerHTML);
        deadline = b[0].innerHTML.indexOf("Priority ");
        console.log(b[0].innerHTML.substring(deadline+9))

        for (i = 0; i < (b.length-1); i++) {

            shouldSwitch = false;
          

            if (b[i].innerHTML.toLowerCase() > b[i + 1].innerHTML.toLowerCase()) {
            
                shouldSwitch= true;
                break;

            } 
        }
        if (shouldSwitch) {
          
          b[i].parentNode.insertBefore(b[i + 1], b[i]);
          switching = true;
        }
  }
};

