const express = require('express');
const { SocketAddress } = require('net');
const app = express();
const server = require('http').createServer(app).listen(3000, () => {
    console.log('listening on *:3000');
});

app.use(express.static(__dirname));

const socketIO = require("socket.io");
const io = socketIO(server);

let clientCount = 0;

const disconnectMsg = "User disconnected";
const connectMsg = "User connected";

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/chat.html');
});

// Connection
io.on('connection', socket => { // socket = connection to the client
    clientCount++;
    updateClientCount();

    // User connected message
    io.emit('accessWarning', { msg: connectMsg, id: socket.id });
    // Welcome message
    socket.emit('welcome', 'Welcome from the Chat Server!!');

    // capture when the client disconnects
    socket.on('disconnect', () => {
        clientCount--;
        updateClientCount();
        // User disconnected message
        io.emit('accessWarning', { msg: disconnectMsg, id: socket.id });
    });

    // Send message event
    socket.on('send', message => {
        io.emit('message', message);
    });

});

// Update client count event
const updateClientCount = () => { io.emit('clientCount', { count: clientCount }); };

// show serve time
setInterval(() => io.emit('time', new Date().toTimeString()), 100);