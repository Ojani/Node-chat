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

joinBtn.onclick = () => {
  menuList.classList.toggle("show");

  if(menuList.classList.contains("show")) {
    joinBtn.innerText = "Close";
  }else {
    joinBtn.innerText = "Join";
  }

}

//removing touch alternative if user has mouse
document.onmousemove = () => {
  document.onmousemove = document.onclick = null;

}
