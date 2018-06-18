'use strict';


var gnanclass = require('gnanclass');
exports.gnanclass = gnanclass;

var scedit = require('scedit');
exports.scedit = scedit;

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

function sendChat(player, chatObjects) {
    var json = JSON.stringify(chatObjects);
    if(__plugin.canary) {
        var Canary = Packages.net.canarymod.Canary;
        var ccFactory = Canary.factory().getChatComponentFactory();
        var cc = ccFactory.deserialize(json);
        player['message(ChatComponent[])'](cc);
    } else {
        var ComponentSerializer = Packages.net.md_5.bungee.chat.ComponentSerializer;
        var cc = ComponentSerializer.parse(json);
        player.spigot().sendMessage(cc);
    }
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
