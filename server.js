const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
//funcion formato mensaje
const formatoMsg = require('./utils/messages');
//funciones acciones de los usuarios
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// Public carpeta estática
app.use(express.static(path.join(__dirname, 'public')));
const botName = 'ForosAyuso';

//Cuando el cliente se conecte:
io.on('connection', socket => {
  socket.on('joinRoom', ({ username, room }) => {
    const user = userJoin(socket.id, username, room);
    
    socket.join(user.room);

    //Bienvenida cuando entra el actual
    socket.emit('message', formatoMsg(botName, 'Bienvenid@ a ForosAyuso!'));

    // A todos se les manda el mensaje "---se unio al chat"
    socket.broadcast
      .to(user.room)
      .emit(
        'message',
        formatoMsg(botName, `${user.username} se unió al chat`)
      );

    // Informacion para los usuarios sobre la sala
    io.to(user.room).emit('roomUsers', {
      room: user.room,
      users: getRoomUsers(user.room)
    });
  });

  // Escucha si hay mensajes
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', formatoMsg(user.username, msg));
  });

  // Cuando usuario abandona el chat:
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);

    if (user) {
      io.to(user.room).emit(
        'message',
        formatoMsg(botName, `${user.username} ha abandonado el chat`)
      );

      // Informacion para los usuarios sobre la sala
      io.to(user.room).emit('roomUsers', {
        room: user.room,
        users: getRoomUsers(user.room)
      });
    }
  });
});

//constante puerto server
const PORT = process.env.PORT || 3000;

server.listen(PORT, () => console.log(`Sever en el puerto: ${PORT}`));
