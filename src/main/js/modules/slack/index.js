var hook  = Packages.java.lang.System.getenv('SLACK_HOOK');
var channel = Packages.java.lang.System.getenv('SLACK_CHANNEL');
var http = require('http');

var sendRaw = function(payload) {
  if (!hook) return;
  http.request({
      url: hook,
      method: 'POST',
      params: {
        payload: JSON.stringify(payload)
      }
    },
    function(responseCode, responseBody) {
    }
  );
}

var send = function(text, playerName) {
  var message = {text: text};
  if (channel) {
    message.channel = channel;
  }
  if (playerName) {
    message.username = playerName;
    message.icon_url = 'https://minotar.net/avatar/' + playerName + '/36.png';
  }
  sendRaw(message);
}

function onCommand(playerName, command) {
  send(playerName + '> ' + command, playerName);
}

function onJoin(playerName) {
  send(playerName + ' connected!', playerName);
}

function onQuit(playerName) {
  send(playerName + ' disconnected!', playerName);
}

function onChat(playerName, message) {
  send(playerName + '> ' + message, playerName);
}

if (__plugin.canary) {
  events.playerCommand(function(e){
    onCommand(e.player.name, Java.from(e.command).join(' '));
  });

  events.connection(function(e){
    onJoin(e.player.name);
  })

  events.disconnection(function(e){
    onQuit(e.player.name);
  })

  events.chat(function (e) {
    onChat(e.player.name, e.message);
  });
} else {
  events.playerCommandPreprocess(function(e){
    onCommand(e.player.name, e.message);
  });

  events.playerJoin(function(e){
    onJoin(e.player.name);
  })

  events.playerQuit(function(e){
    onQuit(e.player.name);
  })

  events.playerChat(function (e) {
    onChat(e.player.name, e.message);
  });
}

send('Server started!');
