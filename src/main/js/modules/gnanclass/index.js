'use strict';
/*global require, module, __plugin, __dirname, echo, persist, isOp, events, Packages, command, global */
var utils = require('utils'),
  watcher = require('watcher'),
  autoload = require('./autoload'),
  foreach = utils.foreach,
  watchDir = watcher.watchDir,
  unwatchDir = watcher.unwatchDir,
  playersDir = __dirname + '/../../players/',
  serverAddress = utils.serverAddress();

require('utils/string-exts');

/************************************************************************
## gnanclass Plugin

The `gnanclass` object contains a couple of utility functions for use
in a gnanclass setting. The goal of these functions is to make it
easier for tutors to facilitate ScriptCraft for use by students in a
gnanclass environment. Although granting ScriptCraft access to
students on a shared server is potentially risky (Students can
potentially abuse it), it is slighlty less risky than granting
operator privileges to each student. (Enterprising students will
quickly realise how to grant themselves and others operator privileges
once they have access to ScriptCraft).

The goal of this module is not so much to enforce restrictions
(security or otherwise) but to make it easier for tutors to setup a
shared server so students can learn Javascript. When scripting is
turned on, every player who joins the server will have a dedicated
directory into which they can save scripts. All scripts in such
directories are automatically watched and loaded into a global
variable named after the player.

So for example, if player 'walterh' joins the server, a `walterh`
global variable is created. If a file `greet.js` with the following
content is dropped into the `scriptcraft/players/walterh`
directory...

```javascript
exports.hi = function( player ){
  echo( player, 'Hi ' + player.name);
};
```

... then it can be invoked like this: `/js walterh.hi( self )` . This
lets every player/student create their own functions without having
naming collisions.

It's strongly recommended that the
`scriptcraft/players/` directory is shared so that
others can connect to it and drop .js files into their student
directories. On Ubuntu, select the folder in Nautilus (the default
file browser) then right-click and choose *Sharing Options*, check the
*Share this folder* checkbox and the *Allow others to create and
delete files* and *Guest access* checkboxes. Click *Create Share*
button to close the sharing options dialog. Students can then access
the shared folder as follows...

 * Windows:   Open Explorer, Go to \\{serverAddress}\players\
 * Macintosh: Open Finder,   Go to smb://{serverAddress}/players/
 * Linux:     Open Nautilus, Go to smb://{serverAddress}/players/

... where {serverAddress} is the ip address of the server (this is
displayed to whoever invokes the gnanclass.allowScripting() function.)

### jsp gnanclass command
The `jsp gnanclass` command makes it easy for tutors to turn on or off
gnanclass mode. This command can only be used by server operators. To
turn on gnanclass mode (enable scripting for all players):

    jsp gnanclass on

To turn off gnanclass mode (disable scripting for all players):

    jsp gnanclass off

The `jsp gnanclass` command is provided as an easier way to turn on or
off gnanclass mode. This should be used in preference to the
gnanclass.allowScripting() function which is provided only for
programmatically enabling or disabling gnanclass mode.

### gnanclass.allowScripting() function

Allow or disallow anyone who connects to the server (or is already
connected) to use ScriptCraft. This function is preferable to granting 'ops' privileges 
to every student in a Minecraft gnanclass environment.

Whenever any file is added/edited or removed from any of the players/
directories the contents are automatically reloaded. This is to
facilitate quick turnaround time for students getting to grips with
Javascript.

#### Parameters

 * canScript : true or false

#### Example

To allow all players (and any players who connect to the server) to
use the `js` and `jsp` commands...

    /js gnanclass.allowScripting( true, self )

To disallow scripting (and prevent players who join the server from using the commands)...

    /js gnanclass.allowScripting( false, self )

Only ops users can run the gnanclass.allowScripting() function - this is so that students 
don't try to bar themselves and each other from scripting.

***/
var store = persist('gnanclass', { enableScripting: false }),
  File = java.io.File;

function revokeScripting ( player ) { 
  console.log('Disabling scripting for player ' + player.name);
  if (__plugin.bukkit){
    foreach( player.getEffectivePermissions(), function( perm ) {
      if ( (''+perm.permission).indexOf( 'scriptcraft.' ) == 0 ) {
	if ( perm.attachment ) {
	  perm.attachment.remove();
	}
      }
    });
  }
  if (__plugin.canary){
    // 
    var Canary = Packages.net.canarymod.Canary;
    Canary.permissionManager().removePlayerPermission('scriptcraft.evaluate',player);
  }
  stopWatching(scriptDirFor(player));
}
var autoloadTime = {};

var watchedDirs = {};

function stopWatching(scriptDir) {
  if(watchedDirs[scriptDir.name]) {
    unwatchDir(scriptDir);
    delete watchedDirs[scriptDir.name];
  }
}

function stopWatchingAll() {
  Object.keys(watchedDirs).forEach(function(name) {
    stopWatching(watchedDirs[name]);
  });
}

var playerEventHandlers = {};

function scriptDirFor(player) {
  var playerName = '' + player.name;
  playerName = playerName.replace(/[^a-zA-Z0-9_\-]/g,'');
  return new File(playersDir, playerName).getCanonicalFile();
}

function reloadPlayerModules( playerDir, notificationCallback){
  console.log('Reloading player modules from ' + playerDir.name);
  /*
   wph 20150118 first unregister any event handlers registered by the player
   */
  var playerDirPath = ''+ playerDir.getAbsolutePath();
  var eventHandlers = playerEventHandlers[playerDirPath];
  if (eventHandlers){
    for (var i = 0;i < eventHandlers.length; i++){
      eventHandlers[i].unregister();
    }
    eventHandlers.length  = 0;
  } else {
    playerEventHandlers[playerDirPath] = [];
    eventHandlers = playerEventHandlers[playerDirPath];
  }

  var playerContext = {};

  /*
   override events so that the listener is stored here so it can be unregistered.
   */
  var oldEvents = events;
  var playerEvents = Object.create(oldEvents);
  playerEvents.on = function( eventType, fn, priority){
    var handler = oldEvents.on(eventType, fn, priority);
    eventHandlers.push(handler);
  };

  try {
    events = playerEvents;

    autoload( playerContext, playerDir, function (error) {
      notificationCallback(error);
    });
  } finally {
    events = oldEvents;
  }

  var moduleName = playerDir.name.replace(/^([0-9])/,'_$1');
  global[moduleName] = playerContext;
}

function grantScripting( player ) {
  console.log('Enabling scripting for player ' + player.name);
  if (__plugin.bukkit){
    player.addAttachment( __plugin, 'scriptcraft.*', true );
  }
  if (__plugin.canary){
    player.permissionProvider.addPermission('scriptcraft.evaluate',true);
  }

  startWatching(scriptDirFor(player), player);
}

function startWatching(scriptDir, player) {
  stopWatching(scriptDir);

  watchedDirs[scriptDir.name] = scriptDir;

  var dirName = scriptDir.name;
  scriptDir.mkdirs();
  var _notify = 
    player ? function (msg) {
               echo(player, msg);
             }
           : function (){};
  function _reload() {
    reloadPlayerModules(scriptDir,
        function(msg) { _notify((msg + '\n-----').red()); });
    _notify('Your code was reloaded !'.green());
  }
  _reload();
  watchDir( scriptDir, function( changedDir ){
    var currentTime = new java.util.Date().getTime();
    //this check is here because this callback might get called multiple times for the watch interval
    //one call for the file change and another for directory change 
    //(this happens only in Linux because in Windows the folder lastModifiedTime is not changed)
    if (currentTime - autoloadTime[dirName]>1000 ) {
      _reload();
    } 
    autoloadTime[dirName] = currentTime;
  });
}

var _gnanclass = {
  revokeScripting: revokeScripting,
  grantScripting: grantScripting,
  allowScripting: function (/* boolean: true or false */ canScript, sender ) {
    sender = utils.player(sender);
    if ( !sender ) {
      console.log( 'Attempt to set gnanclass scripting without credentials' );
      console.log( 'gnanclass.allowScripting(boolean, sender)' );
      return;
    }
    /*
     only operators should be allowed run this function
     */
    if ( !isOp(sender) ) {
      console.log( 'Attempt to set gnanclass scripting without credentials: ' + sender.name );
      echo( sender, 'Only operators can use this function');
      return;
    }
    allowScriptingForConnectedPlayers(canScript);
    store.enableScripting = canScript;

    echo( sender, 'Scripting turned ' + ( canScript ? 'on' : 'off' ) + 
      ' for all players on server ' + serverAddress);
  }
};

function allowScriptingForConnectedPlayers(canScript) {
  utils.players(function(player){
    canScript ? grantScripting(player) : revokeScripting(player);
  });
}

addUnloadHandler(function () {
  stopWatchingAll();
});

function loadExistingScripts() {
  var dir = new File(playersDir);
  if (dir.isDirectory()) {
    Java.from(dir.listFiles()).forEach(function(subdir) {
      if (subdir.isDirectory() && !subdir.isHidden()) {
        startWatching(subdir.getCanonicalFile());
      }
    });
  }
}

if ( store.enableScripting ) {
  loadExistingScripts();
}

allowScriptingForConnectedPlayers(store.enableScripting);

if (__plugin.canary){
  events.connection( function( event ) { 
    if ( store.enableScripting ) {
      grantScripting(event.player);
    }
  }, 'CRITICAL');
} else {
  events.playerJoin( function( event ) { 
    if ( store.enableScripting ) {
      grantScripting(event.player);
    }
  }, 'HIGHEST');
}
module.exports = _gnanclass;
