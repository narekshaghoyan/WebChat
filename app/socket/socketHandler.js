const socket = require("socket.io");
const jwt = require("jsonwebtoken");

const formatMessage = require("../utils/messages");
const {
  userJoin,
  getCurrentUser,
  userLeave,
  getRoomUsers
} = require("../utils/user");

const MY_CUSTOM_SECRET_KEY = process.env.JWT_SECRET_KEY;

const initializeSocket = (server) => {

  const io = socket(server);

  io.on("connection", (socket) => {
    socket.on("chatMsg", (data) => {
      const { msg, token } = data;
      try {
        const decoded = jwt.verify(token, MY_CUSTOM_SECRET_KEY);
        const { username, room } = decoded;

        io.to(room).emit("message", formatMessage(username, msg));
      } catch (error) {
        setTimeout(() => {
          socket.emit("redirect", {
            msg: "Invalid token. Please log in again.",
            url: "/",
          });
        }, 2000);
      }
    });

    socket.on('joinRoom', (token) => {
      try {
        const decoded = jwt.verify(token, MY_CUSTOM_SECRET_KEY);
        const { username, room } = decoded;
    
        // Join the room
        socket.join(room);
    
        // Add user to the room
        const user = userJoin(socket.id, username, room);
    
        // Send a welcome message to the joining user
        socket.emit("message", formatMessage("BOT", "Welcome!"));
    
        // Send a message to room members except the joining user
        socket.to(room).emit(
          "message",
          formatMessage("BOT", `${user.username} has joined the room!`)
        );
    
        // Send updated user list to all clients in the room
        io.to(room).emit("usersInRoom", {
          room: room,
          usersList: getRoomUsers(room),
        });
      } catch (err) {
        console.log(err);
      }
    });
    

    socket.on("disconnect", () => {
      const user = getCurrentUser(socket.id);

      if (!user) return false

      userLeave(socket.id)

      io.to(user.room).emit(
        "message",
        formatMessage("BOT", `${user ? user.username : "Undefended"} has just left!`)
      );
      io.to(user.room).emit(
        "usersInRoom", {
        room: user.room,
        usersList: getRoomUsers(user.room)
      }
      );
    });
  });
}

module.exports = initializeSocket