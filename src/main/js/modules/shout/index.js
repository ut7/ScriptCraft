var utils = require('utils');
var masques;

var _ = require("underscore");

var surCommande = function(e) {
  var commande = e.message;
  var players = e.player.world.players;
  if (!_.contains(masques, e.player.name) && commande.startsWith("/js") && commande.indexOf('#h') < 0) {
    _.each(players, function(observateur) {
      if (observateur.name != e.player.name) echo(observateur, e.player.name.red() + '> ' + commande.yellow());
    });
  }
}
events.playerCommandPreprocess(surCommande);

exports.mute = function(playerName) {
  if (!_.contains(masques, playerName)) {
    masques.push(playerName);
    save(masques);
  }
}

exports.unmute = function(playerName) {
  if (_.contains(masques, playerName)) {
    masques = _.without(masques, playerName);
    save(masques);
  }
}

function save(masques) {
  scsave(masques, 'masques.json');
}

function load() {
  var masques = scload('masques.json');
  if (!masques) {
    masques = [];
    save(masques);
  }
  return masques;
}

masques = load();

exports.masques = masques;
