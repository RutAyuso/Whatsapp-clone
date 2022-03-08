const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// COnseguir el usuario mediante la URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Sala a la que se une
socket.emit('joinRoom', { username, room });

// Obtener usuario y sala
socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Mensaje al server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

  // Scroll para ver todos los mensajes
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Submit del mensaje
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Conseguir el contenido del mensaje
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Mandar mensaje al server/chat
  socket.emit('chatMessage', msg);

  // Limpiar el formulario input del mensaje
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Maquetacion de salida del mensaje
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Añadir el nombre de la habitación maquetada con DOM 
function outputRoomName(room) {
  roomName.innerText = room;
}

// Maquetar los usuarios que se unen con DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

//Mensaje ALERT cuando el usuario se va del chat con DOM
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('¿Estas seguro de que te quieres ir?');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
