const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
app.use(express.static(path.join(__dirname, '..', 'client')));
app.get('/', (req, res) => res.sendFile(path.join(__dirname, '..', 'client', 'index.html')));
const rooms = {};
const users = {};
io.on('connection', (socket) => {
    socket.on('join', (data) => {
        users[socket.id] = {username: data.username, room: data.room, avatar: data.avatar};
        if (!rooms[data.room]) rooms[data.room] = [];
        rooms[data.room].push(socket.id);
        socket.join(data.room);
        io.to(data.room).emit('user joined', {username: data.username});
        io.to(data.room).emit('users update', getRoomUsers(data.room));
        socket.emit('chat message', {username: 'Sistema', msg: Bem-vindo ao !});
    });
    socket.on('joinRoom', (room) => {
        const user = users[socket.id];
        if (user) {
            socket.leave(user.room);
            socket.join(room);
            user.room = room;
            io.to(room).emit('user joined', {username: user.username});
            io.to(room).emit('users update', getRoomUsers(room));
        }
    });
    socket.on('updateAvatar', (avatar) => {
        const user = users[socket.id];
        if (user) user.avatar = avatar;
    });
    socket.on('chat message', (data) => {
        const user = users[socket.id];
        if (user && rooms[user.room]) {
            let msg = data.msg.content;
            if (data.msg.type === 'private') {
                const parts = data.msg.content.split(' ');
                const targetUser = parts[1].replace('@', '');
                const targetSocket = Object.keys(users).find(id => users[id].username === targetUser);
                if (targetSocket) {
                    io.to(targetSocket).emit('chat message', {username: user.username, msg: parts.slice(2).join(' '), avatar: user.avatar});
                    socket.emit('chat message', {username: 'Você', msg: parts.slice(2).join(' '), avatar: user.avatar});
                }
                return;
            }
            io.to(user.room).emit('chat message', {username: user.username, msg, avatar: user.avatar});
        }
    });
    socket.on('disconnect', () => {
        const user = users[socket.id];
        if (user && rooms[user.room]) {
            rooms[user.room] = rooms[user.room].filter(id => id !== socket.id);
            delete users[socket.id];
            io.to(user.room).emit('users update', getRoomUsers(user.room));
        }
    });
});
function getRoomUsers(room) {
    return rooms[room] ? rooms[room].map(id => users[id]) : [];
}
server.listen(3000, () => console.log('Servidor Mkfy rodando na porta 3000'));