const chatView = document.querySelector('#chatDisplay');
const sendButton = document.querySelector('#sendButton');
const timeDisplay = document.querySelector('#time-display');
const chatDisplay = document.querySelector('#chatDisplay');
const messageText = document.querySelector('#message');
const nameText = document.querySelector('#name');
const numConnection = document.querySelector('#numConnection');
const disconnectButton = document.getElementById("disconnectBtn");
const connectButton = document.getElementById("connectBtn");

// Global socket
let socket = '';

// At the beginning you are not connected, the UI is disabled
disableUI();

// Connect button event listener -  enable the UI and start connection with socketio
connectButton.addEventListener('click', () => {
    //enable UI
    enableUI();

    // create the connection
    socket = io();

    //Capture and log welcome message from the server
    socket.on('welcome', data => {
        const msg = document.createElement('p');
        msg.classList.add("access");
        msg.innerHTML = data;
        chatView.appendChild(msg);
    });

    // Capture the event from the server for user connected and display the message
    socket.on('accessWarning', data => {
        if (data.id !== socket.id) {
            const msg = document.createElement('p');
            msg.classList.add("access");
            msg.innerHTML = data.msg;
            chatView.appendChild(msg);
        }
    });

    // Display server time
    socket.on('time', time => {
        timeDisplay.innerHTML = time;
    });

    // Display the message from the server
    socket.on('message', message => {
        const parentDiv = document.createElement('div');
        parentDiv.classList.add("parentDiv");
        const msgWrapper = document.createElement('div');

        // Check if I am the sender ot not
        if (message.id === socket.id) {
            msgWrapper.className = "msgWrapperSend";
        } else {
            msgWrapper.className = "msgWrapperReceive";
        }

        const showMessage = document.createElement('p');

        showMessage.innerHTML = `[ ${message.name} ]  :  ${message.message}`;
        msgWrapper.appendChild(showMessage);
        parentDiv.appendChild(msgWrapper);
        chatView.appendChild(parentDiv);

        console.log(message.name, message.message);
    });

    //Show the number of client connected
    socket.on('clientCount', count => {
        numConnection.innerHTML = count.count;
    });
});

// DISCONNECT event listener
disconnectButton.addEventListener('click', () => {
    // DISCONNECT FROM SERVER
    socket.disconnect();
    //Disable the UI
    disableUI();
});

// ENABLE UI
function enableUI() {
    disconnectButton.disabled = false;
    disconnectButton.style.backgroundColor = 'yellow';
    connectButton.style.backgroundColor = 'lightgray';
    connectButton.disabled = true;
    sendButton.disabled = false;
    nameText.disabled = false;
    messageText.disabled = false;
}

// DISABLE UI
function disableUI() {
    disconnectButton.disabled = true;
    connectButton.disabled = false;
    connectButton.style.backgroundColor = 'skyblue';
    disconnectButton.style.backgroundColor = 'lightgray';
    sendButton.disabled = true;
    nameText.disabled = true;
    messageText.disabled = true;
    numConnection.innerHTML = '';
    timeDisplay.innerHTML = '';
}

// Send button event listener - send the text to the server to broadcast to every connected client
document.querySelector('#sendButton').addEventListener('click', () => {
    if (nameText.value.length === 0) {
        alert('You must enter a name');
    } else if (messageText.value.length === 0) {
        alert('You must enter a message');
    } else {
        socket.emit('send', {
            name: nameText.value,
            message: messageText.value,
            id: socket.id
        });
        messageText.value = '';
    }
});