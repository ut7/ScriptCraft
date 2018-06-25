exports.superman = function(player) {
    player = player || self;
    player.allowFlight = true;
    player.flySpeed = 0.5;
    player.walkSpeed = 0.4;
    player.invulnerable = true;
    echo(player, 'Suupermaaaaan !');
 };


exports.normalman = function(player) {
    player = player || self;
    player.allowFlight = false;
    player.flySpeed = 0.1;
    player.walkSpeed = 0.2;
    player.invulnerable = false;
    echo(player, 'Nooor permaaaaan !');
};


exports.toutLeMondeAvecMoi = function(location) {
    location = location || self.getLocation();
    self.world.players.forEach(function(player) {
        if (player != self) {
            player.teleport(location);
        }
    });
};

exports.onCampeIci = function(ici) {
    if (typeof ici == "undefined") {
        ici = self.getLocation();
    }
    self.world.setSpawnLocation(ici.x,ici.y,ici.z);
};

exports.jour = function() {
    self.world.time = 6000;
};

exports.nuit = function() {
    self.world.time = 18000;
};

var utils = require('utils');
exports.transplaneMoiVers = function(playerName) {
    var player = utils.player(playerName);
    if (player) {
        self.teleport(player);
    }
};

exports.transplaneVersMoi = function(playerName) {
    var player = utils.player(playerName);
    if (player) {
        player.teleport(self);
    }
};

exports.flashmob = function(world) {
    world      = world || defaultWorld;
    var player = self;
    var mobs   = allMobs();
    mobs.forEach(function(mob) { mob.teleport(player); });
};
