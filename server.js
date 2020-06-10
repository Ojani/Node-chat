const io = require("socket.io")(3000);

const users = {}

io.on("connection", socket => {
  socket.on("new-user",name => {
    users[socket.id] = name;
    socket.broadcast.emit("user-connected", `${name} connected!`)

  });

  socket.on("send-message", ({ message, file } = {}) => {

    if(message || file) {

      const response = {}

      response.name = users[socket.id];

      if(message && message.replace(/ /g, "") != "") response.message = message;

      if(file) response.file = file;

      socket.broadcast.emit("chat-message", response);
    }

  })

  socket.on("disconnect", () => {
    if(users[socket.id] != null) {
      socket.broadcast.emit("chat-message", `${users[socket.id]} disconnected`);
    }

  })

})
