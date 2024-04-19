const socket = io();
const params = new URLSearchParams(window.location.search)

const token = params.get("token");

const chatForm = document.getElementById("chat-form");

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const msg = e.target.elements.msg.value;
  e.target.elements.msg.value = "";
  e.target.elements.msg.focus();
  socket.emit("chatMsg", msg);
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


if (token) {
  localStorage.setItem("token", token);
} else {
  const msg = "You are not authorized to access this page.";
  const status = "fail";
  window.location.href = `/index.html?message=${msg}&status=${status}`;
}