var socket = io();
let ready = parseInt(user.ready);
let gameCountDown = 5;
let gameReady = false;
let question;
let answer = 0;
let gQuest = 0;

let questionNumber = 1;
let maxQuestion = 0;
let timeEveryQuestion = 10;
let allScore = 0;
let questionScore = 0;


socket.emit('join-game', user);

function message(data) {
    return `
      <li class="message left appeared">
        <div class="avatar">
          <div class="player">
            <p> ${data.name} </p>
          </div>
        </div>
        <div class="text_wrapper">
          <div class="text"> ${data.text} </div>
        </div>
      </li>`;
}

function generateQuestion(question) {
    var answer = '';

    $.each(question.answer, (k, v) => {
        answer += `<div class="col-md-12 game-answer-unchecked" id="answer-${k}" onclick="answerOnClick(this, ${v.score})">
                    <h4> ${v.text} </h4>
                  </div>`;
    });

    return `
      <p class="text-center" id="question-time">  </p>

      <div class="col-md-12" style="margin-top:10%">
        <div class="col-md-12">
          <h3 class="game-question" id="game-question"> ${question.question} </h3>
        </div>
      </div>

      <div class="col-md-12 row" style="margin-top:5%;" id="game-answer">
        ${answer}
      </div>
    `;
}

function userActiveTemplate(user) {
    return `
      <li id="${user.token}">
        ${user.name}

        <span id="status${user._id}" class="player-status btn ${user.ready > 0? 'btn-success' : 'btn-danger'} btn-sm">
          ${user.ready > 0? 'SIAP' : 'BELUM SIAP'}
        </span>
      </li>
    `;
}

function getSelectedAnswer() {
    var answerBody = $('#game-answer');
}

function gameover() {
  $('#game-start').show();
  $('#game-start').hide();
  $('#question-time').hide();
  $('#game-score').hide();
}

function startGame() {
    if (gameReady == true) {
      if (gameCountDown < 0) {

        var gameContainer = $('#game-start'),
            gameQuestionTimer = $('#question-time'),
            gameScore = $('#game-score-amount');

        // game finish
        if (maxQuestion == questionNumber) {
          gameover();
        }

        // lets start the game
        $('#game-ready-check').hide();
        $('#game-start').show();
        $('#question-time').show();
        $('#game-score').show();


        if (gQuest == 0) {
          var quest = generateQuestion(question[questionNumber-1]);
          gameContainer.html(quest);
          gQuest = 1;
        }


        gameQuestionTimer.html(`<h4> ${timeEveryQuestion} </h4>`)
        timeEveryQuestion--;


        if (timeEveryQuestion < 0) {
          allScore += questionScore;

          gameScore.html(allScore);

          questionScore = 0;
          questionNumber++;
          timeEveryQuestion = 10;
          answer = 0;
          gQuest = 0;
        }

      } else {
        $('#game-notice').html('Game akan dimulai dalam : ' + gameCountDown);
        gameCountDown--;
      }
    } else {
      $('#game-ready-check').show();
      $('#game-start').hide();
      $('#question-time').hide();
      $('#game-score').hide();
      $('#game-notice').html('Game akan dimulai jika seluruh pemain ready');
      gameCountDown = 5;
    }

    console.log(gameCountDown);
}

setInterval(function(){
  startGame()
}, 1000);

socket.on('user-list', (data) => {
    $.each(data, (key, value) => {
      var playerCheck = $(`#${value.token}`).length;
      if (playerCheck == 0) {
        var templateUserActive = userActiveTemplate(value);
        $('#player-list').append(templateUserActive);
      }
    });
});

socket.on('user-disconnect', (data) => {
    $('#player-list').find(`#${data}`).remove();
});

socket.on('user-send-text', (data) => {
    var getMessageTemplate = message(data);
    $('#list-message').append(getMessageTemplate);
});

socket.on('user-ready' , (data) => {
    var element = $(`#status${data._id}`);

    if (data.ready > 0) {
      element.removeClass('btn-danger');
      element.addClass('btn-success');
      element.html('SIAP')
    } else {
      element.addClass('btn-danger');
      element.removeClass('btn-success');
      element.html('BELUM SIAP')
    }
});

socket.on('user-all-ready', (data) => {
    question = data;
    maxQuestion = data.length;

    gameReady = true;
});

socket.on('user-all-notready', (data) => {
    gameReady = false;
});

$(document).on('submit', '#send-message-form', (event) => {
    event.preventDefault();
    var text = $('#text').val();
    if (text) {
      socket.emit('send-text', {
        name: user.name,
        text: text
      });
    }

    $('#text').val('');
});

$(document).on('click', '#ready-state', () => {
    var button = $('#ready-state');

    if (ready == 0) {
      ready = 1;
      $('#ready-state').html('BELUM SIAP');
      $('#ready-state').removeClass('btn-success');
      $('#ready-state').addClass('btn-danger');
    } else {
      ready = 0;
      $('#ready-state').addClass('btn-success');
      $('#ready-state').removeClass('btn-danger');
      $('#ready-state').html('SIAP');
    }

    socket.emit('ready', {user: user, ready: ready});
});


function answerOnClick(div, score) {
    var content = $(div);

    console.log(div,score);

    if (answer == 0) {
      content.removeClass('game-answer-unchecked');
      content.addClass('game-answer-checked');

      questionScore = score;
      answer = 1;
    }
}
