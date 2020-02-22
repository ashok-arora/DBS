var temp_left = 0, temp_top = 0;
/* document.getElementById("Aniket_info").innerHTML = "huun na mai chutiya"; */
setInterval(function(){
  var elem = document.getElementById("test_player");
  document.onkeydown = function(event){
    for(var i = 0; i < 4; i++){
      if(i == event.keyCode - 37){
        temp_left = (1 - (i % 2))*(i + -1);
        temp_top = (i % 2)*(2 * i - 4);
      }
    }   
  };
  var left = parseFloat(elem.style.left);
  var top = parseFloat(elem.style.top);
  var width = parseFloat(elem.style.width);
  var height = parseFloat(elem.style.height);
  left = (left + temp_left) % (100 - width);
  if(left < 0)
    left = 100 - width - 1;
  top = (top + temp_top) % (100 - height);
  if(top < 0)
    top = 100 - height - 1;
/*   document.getElementById("Aniket_info").innerHTML = temp_left + " " + temp_top + " " + left + " " + top; */
  elem.style.left = left + "%";
  elem.style.top = top + "%";
}, 50);