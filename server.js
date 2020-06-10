const io = require("socket.io")(3000);

const users = {}

io.on("connection", socket => {
  socket.on("new-user",name => {
    users[socket.id] = name;
    socket.broadcast.emit("user-connected", `${name} connected!`)

  });

  socket.on("send-message", ({ message, img } = {}) => {
    //not sending image if image src is not a valid one
    if(img && img.slice(0,4) != "data") img = null;

    if(message || img) {

      const response = {}

      response.name = users[socket.id];

      if(message && message.replace(/ /g, "") != "") response.message = message;

      if(img) response.img = img;

      socket.broadcast.emit("chat-message", response);
    }

  })

  socket.on("disconnect", () => {
    if(users[socket.id] != null) {
      socket.broadcast.emit("chat-message", `${users[socket.id]} disconnected`);
    }

  })

})
