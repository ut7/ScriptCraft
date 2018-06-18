exports.superman = function(player) {
    player = player || self;
    player.allowFlight = true;
    player.flySpeed = 0.5;
    player.walkSpeed = 0.4;
    player.handle.abilities.isInvulnerable = true;
    player.handle.updateAbilities();
    echo(player, 'Suupermaaaaan !');
 };


exports.normalman = function(player) {
    player = player || self;
    var caps = player.capabilities;
    player.allowFlight = false;
    player.flySpeed = 0.1
    player.walkSpeed = 0.2;
    player.handle.abilities.isInvulnerable = false;
    player.handle.updateAbilities();
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
}

exports.toutLeMondeByeBye = function(pass) {
    if (pass == 'xefi_is_ze_best') {
        var players = Java.from(self.world.playerList);
        players.forEach(function(player) {
            if (player != self) {
                player.kill();
            }
        });
    }
};

var leTempsPasse = true;

exports.leTempsPasseOuPas = function(ilPasse) {
    leTempsPasse = ilPasse || !leTempsPasse;
    server.consoleCommand('gamerule doDaylightCycle ' + leTempsPasse);
    if (leTempsPasse) {
        echo(self, "Coule le temps !");
    } else {
        echo(self, "Ô temps, suspends ton vol ...");
    }
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


var _ = require('underscore'),
    blocks = require('blocks');

function putBlock(x, y, z, blockId, metadata, world, update) {
  if (typeof metadata == 'undefined') {
    metadata = 0;
  }
  var block = world.getBlockAt(x, y, z);

  if (__plugin.canary) {
    var BlockType = Packages.net.canarymod.api.world.blocks.BlockType;
    block.type = BlockType.fromId(blockId);
    var applyProperties = require('blockhelper').applyProperties;
    applyProperties(block, metadata);
    if (typeof update === 'undefined') {
      update = true;
    }
    block.update();
  }
  if (__plugin.bukkit) {
    block.setTypeIdAndData(blockId, metadata, false);
    block.data = metadata;
  }
  return block;
}

var utils = require("utils");

var mobsEnabled = false;

exports.mobs = function(enabled, world) {
    if (typeof(enabled) === "undefined") {
        mobsEnabled = !mobsEnabled;
    } else {
        mobsEnabled = enabled;
    }
    world = world || self.world;
    server.consoleCommand('gamerule doMobSpawning ' + mobsEnabled);
    if (!mobsEnabled) {
        var mobs = Java.from(self.world.mobList);
        mobs.forEach(function(mob) {
            mob.kill();
        });
        echo(self, "Dodo les mobs !");
    } else {
        echo(self, "Les mobs se réveillent ...");
    }
};
var direATous = function(message, world) {
    world.playerList.forEach(function(player) {
        echo(player, message);
    });
};

var timeout;

var decompte = function(minutesRestantes, world) {
    if (minutesRestantes > 0) {
        direATous("Les mobs arrivent dans " + minutesRestantes + " minutes !", world);
        timeout = setTimeout(function() {
            decompte(minutesRestantes - 1, world);
        }, 60 * 1000);
    } else {
        exports.mobs(true, world);
        direATous("Les mobs arrivent !!!", world);
        timeout = setTimeout(function() {
            exports.attaquez(world, world.playerList);
        }, 60 * 1000);
    }
};

exports.lesMobsArriventDansNMinutes = function(delai, world) {
    if (timeout) {
        clearTimeout(timeout);
        timeout = false;
    }
    world = world || self.world;
    world.time = 13200 - delai * 1200;
    exports.leTempsPasseOuPas(true);
    exports.mobs(false);
    decompte(delai, world);
};

exports.flashmob = function(world) {
    world = world || self.world;
    var mobs = Java.from(world.mobList);
    mobs.forEach(function(mob) {
        mob.teleportTo(up(1).getLocation());
    });
};

var un_parmi = function(liste) {
    return liste[Math.floor(Math.random() * liste.size())];
};

exports.attaquez = function(world, players) {
    world = world || self.world;
    players = players || world.playerList;
    var mobs = Java.from(world.mobList);
    if (mobs.length > 0) {
        players.forEach(function(player) {
            echo(player, "Les mobs attaquent !");
        });
    }
    mobs.forEach(function(mob) {
        if (mob.entityType.name != 'ENDERMAN') {
            mob.setAttackTarget(un_parmi(players));
        }
    });
};

var nomImmobilises = [];

var _ = require('underscore'),
    utils = require('utils'),
    BLINDNESS = Packages.net.canarymod.api.potion.PotionEffectType.BLINDNESS;

var playerMove = function(event) {
    if (_.contains(nomImmobilises, event.player.name)) {
        event.player.teleportTo(event.from);
    }
}

events.playerMove(function(event) {
    playerMove(event);
});

var immobilise = function(name) {
    if (!_.contains(nomImmobilises, name)) {
        nomImmobilises.push(name);
        var player = server.getPlayer(name);
        gnanclass.revokeScripting(player);
    }
}

var libere = function(name) {
    var player = server.getPlayer(name);
    nomImmobilises = _.without(nomImmobilises, name);
    player.removePotionEffect(BLINDNESS);
    gnanclass.grantScripting(player);
}

exports.stupefix = immobilise;
exports.enervatum = libere;
