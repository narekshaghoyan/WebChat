const express = require("express");
const path = require("path");
const http = require("http");
const socket = require("socket.io");
const formatMessage = require("./app/utils/messages");
const bodyParser = require("body-parser");
const authRoutes = require("./app/routes/authRoutes");

const app = express();
const server = http.createServer(app);
const io = socket(server);

app.use(express.static(path.join(__dirname, "public")));
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', authRoutes)

io.on("connection", (socket) => {
  socket.emit("message", formatMessage("BOT", "welcome!"));
  socket.broadcast.emit(
    "message",
    formatMessage("BOT", "A user just connected!")
  );

  socket.on("chatMsg", (m) => {
    io.emit("message", formatMessage("USER", m));
  });

  socket.on("disconnect", () => {
    io.emit("message", formatMessage("BOT", "A user has just left!"));
  });
});

server.listen(3000, () => {
  console.log("Server listens to port 3000");
});


module.exports = app