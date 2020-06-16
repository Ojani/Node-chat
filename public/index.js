if(window.location.hostname == "localhost") {
  var socket = io.connect("http://localhost:"+location.port);

} else {
  var socket = io.connect(window.location.hostname);

}

//adding links to added chat rooms
const menuList = document.querySelector(".menuList");

socket.on("room-created", room => {
  const a = document.createElement("a");
  a.innerText = room;
  a.href = room;
  menuList.append(a);
});

//add support for mobile since hovering wont work
const joinBtn = document.querySelector(".dropDownBtn");

document.onclick = e => {
  if(e.target.className == "dropDownBtn") {
    document.querySelector(".menuList").style.display = "block";
    document.querySelector("input").style.display = "none";

  } else {
    document.querySelector(".menuList").style.display = "none";
    document.querySelector("input").style.display = "block";

  }

}

//removing touch alternative if user has mouse
document.onmousemove = () => {
  document.onmousemove = document.onclick = null;

}
