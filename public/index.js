if(window.location.hostname == "localhost") {
  var socket = io.connect("http://localhost:"+location.port);

} else {
  var socket = io.connect(window.location.hostname);

}

const menuList = document.querySelector(".menuList");

socket.on("room-created", room => {
  const a = document.createElement("a");
  a.innerText = room;
  a.href = room;
  menuList.append(a);
});
