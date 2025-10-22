const socket = io();
const form = document.getElementById('form');
const input = document.getElementById('input');
const messages = document.getElementById('messages');
const usersList = document.getElementById('usersList');
const roomSelect = document.getElementById('roomSelect');
const toggleRooms = document.getElementById('toggleRooms');
const toggleAvatar = document.getElementById('toggleAvatar');
const toggleEmoji = document.getElementById('toggleEmoji');
const avatarPanel = document.getElementById('avatarPanel');
const roomsPanel = document.getElementById('roomsPanel');
const emojiPanel = document.getElementById('emojiPanel');
const emojiList = document.getElementById('emojiList');
let currentRoom = 'lobby';
let username = prompt('Seu nome de usuário:') || 'Anônimo';
let avatar = {body: 'slim', outfit: 'casual'};
document.getElementById('bodyType').value = avatar.body;
document.getElementById('outfit').value = avatar.outfit;

// Lista de emojis
const emojis = ['😊', '😂', '😍', '😎', '🥳', '😢', '😡', '🚀', '🌟', '💬'];
emojis.forEach(emoji => {
    const span = document.createElement('span');
    span.className = 'emoji';
    span.textContent = emoji;
    span.addEventListener('click', () => {
        input.value += emoji;
        emojiPanel.classList.add('hidden');
        input.focus();
    });
    emojiList.appendChild(span);
});

socket.emit('join', {username, room: currentRoom, avatar});
toggleRooms.addEventListener('click', () => {
    roomsPanel.classList.toggle('hidden');
    emojiPanel.classList.add('hidden');
});
toggleAvatar.addEventListener('click', () => {
    avatarPanel.classList.toggle('hidden');
    emojiPanel.classList.add('hidden');
});
toggleEmoji.addEventListener('click', () => {
    emojiPanel.classList.toggle('hidden');
    roomsPanel.classList.add('hidden');
    avatarPanel.classList.add('hidden');
});
document.getElementById('saveAvatar').addEventListener('click', () => {
    avatar = {body: document.getElementById('bodyType').value, outfit: document.getElementById('outfit').value};
    socket.emit('updateAvatar', avatar);
    avatarPanel.classList.add('hidden');
});
document.getElementById('joinRoom').addEventListener('click', () => {
    currentRoom = roomSelect.value;
    socket.emit('joinRoom', currentRoom);
    roomsPanel.classList.add('hidden');
});
form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (input.value) {
        const msg = input.value.startsWith('/private') ? {type: 'private', content: input.value} : {content: input.value};
        socket.emit('chat message', {msg, room: currentRoom, to: username});
        input.value = '';
    }
});
socket.on('chat message', (data) => {
    const item = document.createElement('li');
    item.innerHTML = <strong> ():</strong> ;
    messages.appendChild(item);
    messages.scrollTop = messages.scrollHeight;
});
socket.on('user joined', (data) => {
    const li = document.createElement('li');
    li.textContent = ${data.username} entrou;
    messages.appendChild(li);
});
socket.on('users update', (users) => {
    usersList.innerHTML = '';
    users.forEach(user => {
        const li = document.createElement('li');
        li.textContent = user.username;
        usersList.appendChild(li);
    });
});