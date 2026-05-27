const express = require('express');
const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);
app.use(express.static('public'));
server.listen(3002, () => console.log('Collab server listening on port 3002'));
