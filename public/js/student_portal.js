var active = 0;
var last = active;
pages = ["home"];
function changeSelection(nextIndex) {
    document.getElementById("sideBarIcon[" + active + "]").style.display = "none";
    var elem = document.getElementById("sideBarIcon[" + nextIndex + "]");
    elem.style.display = "initial";
    if(nextIndex != 4){
        document.getElementById("belowHeaderBody["+ active + "]").style.display = "none";
        var page = document.getElementById("belowHeaderBody[" + nextIndex + "]");
        page.style.display = "initial";
        page.style.flex = "1";
    }
    else{
        var page = document.getElementById("belowHeaderBody[" + nextIndex + "]");
        page.style.display = "initial";
    }
    last = active;
    active = nextIndex;
}

function changeToLastSelection() {
    changeSelection(last);
}
changeSelection(0);