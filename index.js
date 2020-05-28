var app = require('express');
var express = app();
var http = require('http').createServer(express);
var io = require('socket.io')(http);
var anime = require('animejs');

express.use('/public/', app.static(__dirname + '/public'));
express.use('/module/', app.static(__dirname + '/node_modules'));

express.get('/', (req, res) => {
  // res.sendFile(__dirname + '/template/index.html');
  res.render(__dirname + '/template/index.html', {name : 'test'});
  res.render(__dirname + "/views/layouts/main.html", {name:name});
});

express.get('/welcome', (req, res) => {
  res.sendFile(__dirname + '/template/question.html');
});

// socket io
io.on('connection', (socket) => {
  console.log('someone connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('join-game' , (username) => {
    console.log('user join game with name : ' + username);
  });
});
// end socket io


http.listen(3000, () => {
  console.log('express is running on port : 3000');
});
