'use strict';


var gnanclass = require('gnanclass');
exports.gnanclass = gnanclass;

var scedit = require('scedit');
exports.scedit = scedit;

var sendChat = require('clickable-chat').sendChat;

if(__plugin.canary) {
    events.teleport(function(evt) {
        if (evt.teleportReason.name() != 'RESPAWN') { return ; }
        showScEditUrl(evt.player);
    });
} else {
    var welcome = function(evt) {
        showScEditUrl(evt.player);
    }
    events.playerRespawn(welcome);
    events.playerJoin(welcome);
}

function showScEditUrl(player) {
    if (! scedit.enabled()) { return ; }
    var url = scedit.getUrlFor(player.name);

    var chat = [{
        text: "Tu peux éditer ton code en cliquant "
    }, {
        text: "ici",
        clickEvent: {
            action: 'open_url',
            value: url
        },
        color: 'blue',
        underlined: true,
    }];

    sendChat(player, chat);
};

