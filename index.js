const app = require('express');
const express = app();
const http = require('http').createServer(express);
const io = require('socket.io')(http);
const anime = require('animejs');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const randomstring = require('randomstring');

express.use('/public/', app.static(__dirname + '/public'));
express.use('/module/', app.static(__dirname + '/node_modules'));

express.use(app.static(__dirname + '/public'));
express.set('view engine', "ejs");

express.use(bodyParser.urlencoded({
  extended: true
}));
express.use(bodyParser.json());

// ------------------------------- MAIN -----------------------------------

var $ipsConnected = [];

express.get('/', (req, res) => {
  res.render('index', {token: randomstring.generate(20)});
});

express.get('/play', (req, res) => {
  res.render('question');
});

http.listen(3000, () => {
  console.log('express is running on port : 3000');
});

// socket io
io.on('connection', (socket) => {
  console.log('someone connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('join-game' , (data) => {
    var text = 'user join game with name : ' + data.username;
    console.log(text);
    io.emit('user-list', data.username);
  });

});
// end socket io
