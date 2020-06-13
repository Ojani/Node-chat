const socket = io("http://localhost:3000")

const menuList = document.querySelector(".menuList");

socket.on("room-created", room => {
  const a = document.createElement("a");
  a.innerText = room;
  a.href = room;
  menuList.append(a);
});
