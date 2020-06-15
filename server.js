const express = require('express');
const app = express();


app.set("views", "./views");
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));

const HOST = "localhost";
const PORT = process.env.PORT || 3000;

var server = app.listen(PORT, HOST, function(err) {
  if (err) return console.log(err);
  console.log("Listening at http://%s:%s", HOST, PORT);
});

const io = require("socket.io")(server);


const rooms = { Room1: { users: {} } }


app.get("/", (req, res) => {
  res.render("index", { rooms: rooms });

});

app.post("/room", (req, res) => {
  const room = req.body.room;

  if(rooms[room] != null) {
    return res.redirect(room);
  }

  if(room.replace(/ /g, "") == "") {
    return res.redirect("/");
  }

  rooms[room] = { users: {} };
  res.redirect(room);
  //send msg that new room was made
  io.emit("room-created", room);

});

app.get("/:room", (req, res) => {
  if(rooms[req.params.room] == null) {
    return res.redirect("/");

  }

  res.render("room", { roomName: req.params.room, users: rooms[req.params.room].users });

});



io.on("connection", socket => {
  socket.on("new-user", (name, room) => {
    socket.join(room);
    rooms[room].users[socket.id] = name;
    socket.to(room).broadcast.emit("user-connected", name, socket.id);

  });

  socket.on("send-message", ({ message, file } = {}, room) => {

    if(message || file) {

      const response = {}

      response.name = rooms[room].users[socket.id];

      if(message && message.replace(/ /g, "") != "") response.message = message;

      if(file) response.file = file;

      socket.to(room).broadcast.emit("chat-message", response);
    }

  })

  socket.on("disconnect", () => {
    getUserRooms(socket).forEach(room => {
      socket.broadcast.emit("user-disconnected", rooms[room].users[socket.id], socket.id);
      delete rooms[room].users[socket.id];
    });
  });
});

function getUserRooms(socket) {
  return Object.entries(rooms).reduce((names, [name, room]) => {
    if(room.users[socket.id] != null) names.push(name);
    return names;

  }, []);

}
