'use strict';

const app = require('express');
const express = app();
const http = require('http').createServer(express);
const io = require('socket.io')(http);
const anime = require('animejs');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const randomstring = require('randomstring');
const MongoClient = require('mongodb').MongoClient;
const question = require('./data/question.json');

// const connectionString = 'mongodb://rifqi:kepolu123@127.0.0.1:27017';
// const connectionString = 'mongodb://127.0.0.1:27017';
const connectionString = "mongodb+srv://rifqi:kepolu123@cluster0-xc40y.mongodb.net/question-game?retryWrites=true&w=majority";

express.use('/public/', app.static(__dirname + '/public'));
express.use('/module/', app.static(__dirname + '/node_modules'));
express.use(app.static(__dirname + '/public'));
express.set('view engine', "ejs");

express.use(bodyParser.urlencoded({
  extended: true
}));
express.use(bodyParser.json());

// ------------------------------- MAIN -----------------------------------
var allPlayerConnect = [];
var allPlayerScore = [];


MongoClient.connect(connectionString, {useUnifiedTopology: true})
  .then((client) => {
    const db = client.db('question-game');
    const userCollection = db.collection('users');

    express.get('/', (req, res) => {
        res.render('index');
    });

    express.post('/play', (req, res) => {
        var body = req.body,
            generateToken = randomstring.generate(50);

        body['token'] = generateToken;
        body['status'] = 1;
        body['ready'] = 0;

        userCollection.insertOne(body).then((result) => {
          res.redirect('/game?token=' + generateToken);
        }).catch((err) => {
          res.redirect('/');
        });
    });

    express.get('/game', (req, res) => {
        var token = req.query.token;

        if (token) {
          userCollection.findOne({token: token}).then((result) => {
            res.render('question', {user: result});
          }).catch((error) => {
            res.redirect('/');
          });
        }  else {
          res.redirect('/')
        }
    });

    // socket io
    io.on('connection', (socket) => {
        var token = '',
            allReady = false,
            submitedScore = false;

        socket.on('disconnect', () => {
            var where = { token: token };
            var replace = { $set: {status: 0, ready: 0} };
            userCollection.updateOne(where, replace, (err, res) => {
              io.emit('user-disconnect', token);
              allPlayerScore = [];
            });
        });

        socket.on('join-game' , (data) => {
            token = data.token;

            var where = { token: token };
            var replace = { $set: {status: 1} };
            userCollection.updateOne(where, replace, function(err, res) {
              userCollection.find({status: 1}).toArray(function(err, result) {
                  io.emit('user-list', result);
              });
            });
        });

        socket.on('ready', (data) => {
          token = data.user.token;
          var where = { token: token };
          var replace = { $set: {ready: data.ready} };
          userCollection.updateOne(where, replace, function(err, res) {
            userCollection.findOne(where).then((result) => {
              io.emit('user-ready', result);
            });

            userCollection.find({status: 1}).count().then((result) => {
              let activeUser = result;
              userCollection.find({status:1, ready:1}).count().then((result) => {
                let readyUser = result;

                if (activeUser == readyUser) {
                  allReady = true;
                  io.emit('user-all-ready', question);
                } else {
                  allReady = false;
                  io.emit('user-all-notready');
                }
              });
            });
          });
        });

        socket.on('send-text', (data) => {
            io.emit('user-send-text', data);
        });

        socket.on('submit-score', (data) => {
            allPlayerScore.push(data);

            io.emit('show-player-score', allPlayerScore);
        });
    });
    // end socket io

  }).catch((err) => {
    res.send('error database');
    console.log('database error');
  });

http.listen(3000, () => {
  console.log('express is running on port : 3000');
});
