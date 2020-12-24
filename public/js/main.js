const chatForm = document.getElementById("chat-form");
const chatMessages = document.querySelector(".chat-messages");
const roomName = document.getElementById("room-name");
const userList = document.getElementById("users");
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit("joinRoom", { username, room });
localStorage.setItem("chatcord_user", JSON.stringify({ username, room }));

socket.on("roomUsers", ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

socket.on("message", (message) => {
  var pattern = /\B@[a-z0-9_-]+/gi;
  const mentioned = message.text.match(pattern);
  if (Array.isArray(mentioned) && mentioned.length) {
    for (let i = 0; i < mentioned.length; i++) {
      const mentionedUsername = mentioned[i].substring(1);
      if (mentionedUsername === username) {
        // alert(`You were mentioned by ${message.username}`);
        if (!("Notification" in window)) {
          alert("This browser does not support desktop notification");
        } else if (Notification.permission === "granted") {
          // If it's okay let's create a notification
          var notification = new Notification(
            `${message.username} pinged you`,
            {
              body: message.text,
              icon: "https://test.tricycle.group/favicon.ico",
            }
          );
        } else if (Notification.permission !== "denied") {
          Notification.requestPermission().then(function (permission) {
            // If the user accepts, let's create a notification
            if (permission === "granted") {
              var notification = new Notification("Hi there!");
            }
          });
        }
      }
      console.log(username);
    }
  }
  console.log(message);
  outputMessage(message);

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Message Submit
chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  // Get message text
  const msg = event.target.elements.msg.value;

  // Emit message to server
  socket.emit("chatMessage", msg);

  event.target.elements.msg.value = "";
  event.target.elements.msg.focus;
});

function outputMessage(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
  <p class="text">
  ${message.text}
  </p>`;
  document.querySelector(".chat-messages").appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = "";
  users.forEach((user) => {
    const li = document.createElement("li");
    li.innerText = user.username;
    userList.appendChild(li);
  });
}
