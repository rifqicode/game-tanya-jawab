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

function userActiveTemplace(user) {
    return `
      <li id="${user.token}">
        ${user.name}

        <span id="status${user._id}" class="player-status btn ${user.ready > 0? 'btn-success' : 'btn-danger'} btn-sm">
          ${user.ready > 0? 'SIAP' : 'BELUM SIAP'}
        </span>
      </li>
    `;
}


function startGame() {
    if (gameReady == true) {
      $('#game-notice').html('Game akan dimulai dalam : ' + gameCountDown);
      gameCountDown--;
    } else {
      $('#game-notice').html('Game akan dimulai jika seluruh pemain ready');
      gameCountDown = 10;
    }
}

var socket = io();
let ready = parseInt(user.ready);
let gameCountDown = 10;
let gameReady = false;

setInterval(function(){ startGame() }, 1000);

socket.emit('join-game', user);
socket.on('user-list', (data) => {
    $.each(data, (key, value) => {
      var playerCheck = $(`#${value.token}`).length;
      if (playerCheck == 0) {
        var templateUserActive = userActiveTemplace(value);
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
    console.log('woi');
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
