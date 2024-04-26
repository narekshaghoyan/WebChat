const socket = io();
const params = new URLSearchParams(window.location.search)

const token = params.get("token");

const chatForm = document.getElementById("chat-form");

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
  socket.emit("chatMsg", { msg, token });
});

function outputMsg(data) {
  const div = document.createElement("div");
  const container = document.querySelector(".chat-messages");
  div.classList.add("message");

  div.innerHTML = `<p class='meta'>${data.username}
<span>${data.time}</span></p><p class='text'>${data.message}</p>`;
  container.appendChild(div);
}

socket.on("message", (data) => {
  outputMsg(data);
});

socket.on("redirect", (data) => {
  alert(data.msg);
  window.location.href = data.url;
});

socket.on("usersInRoom", (data) => {
  RoomName = data.room
  Users = data.usersList

  outputRoom(RoomName)
  outputUsersList(Users)
});

function outputRoom(room) {
  const roomName = document.getElementById('room-name');

  roomName.innerText = room
}

function outputUsersList(users) {
  const usersList = document.getElementById('users');

  console.log(users);

  usersList.innerHTML = `
  ${users.map((user) => `<li>${user.username}</li>`).join("")}`
}

if (token) {
  localStorage.setItem("token", token);
  socket.emit('joinRoom', token)
} else {
  const msg = "You are not authorized to access this page.";
  const status = "fail";
  window.location.href = `/index.html?message=${msg}&status=${status}`;
}

document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Are you sure you want to leave the chatroom?');

  if (leaveRoom) {
    window.location = '../index.html'
  }
});

