var File     = java.io.File;
var utils    = require("utils");
var entities = require("entities"); // Used to check if something is a player

// Return the players who made the code which generated the exception
// by looking in the stack trace.
// Return an array of all the involved player (usually, only one person)
// return an empty array if we couldn't find one, or if they are offline
var findProgrammerPlayers = function(exception) {
    var out    = [];
    var frames = [];
    if (nashorn) {
        frames = utils.array(exception.getStackTrace());
    } else {
        console.log("findProgrammerPlayers needs nashorn engine");
    }

    frames.forEach(function(frame) {
        var file = new File(frame.fileName);
        if (!file.isFile())
            return;
        // In a classroom environment, a player 'Bob' scripts are inside a folder 'Bob/'. We can't
        // look directly at the parentFile name, because the scripts can be organized as you want
        // inside 'Bob/' : they can be in subfolders if you want So we'll just look every parentFile
        // name until root (no more parentFile), and test if it's a connected player :)
        while ((file = file.parentFile) !== null) {
            // if utils.player is called with an empty string, it will return self (spigot's
            // Server.getPlayer() quirk) - obviously we don't want to use it
            if (file.name === "") {
                continue;
            }
            var player = utils.player(file.name);
            if (entities.player(player)) {
                out.push(player);
                return;
            }
        }
    });
    return out;
};

// Find player to send the exception to.
// fastMode is an optional parameter : if it's true, we will simply look in the exception stack, and
// not in the event parameters
var findReceivers = function(event, exception, fastMode) {
    // First, let's see if we can find who made an error in his code ...
    var out = [];
    out     = findProgrammerPlayers(exception);
    if (out.length > 0) {
        return out;
    }
    if (fastMode) {
        return [];
    }
    // Now, let's try to see if this event involves a player
    // PlayerEvent : they all have a player parameter, it's easy
    if (entities.player(event.player)) {
        return [event.player];
    }
    // EntityEvent : some can apply to a player ( like EntityDamageEvent), so let's try for this
    if (entities.player(event.entity)) {
        return [event.entity];
    }
    // InventoryEvent : a player should be involved ; we must look in the view
    if (event.view && entities.player(event.view.player)) {
        return [event.view.player];
    }
    // InventoryMoveItemEvent : a player can be involved (but it can be autonomous, with hopper for
    // example)
    if (event.sourceInventory && entities.player(event.sourceInventory.holder)) {
        return [event.sourceInventory.holder];
    }
    if (event.destinationInventory && entities.player(event.destinationInventory.holder)) {
        return [event.destinationInventory.holder];
    }

    // PlayerLeashEntityEvent : a player will be involved, but he'll be named leasher
    if (entities.player(event.leasher)) {
        return [event.leasher];
    }
    // TabCompleteEvent : a player can be involved, as the sender
    if (entities.player(event.sender)) {
        return [event.sender];
    }

    // VehicleEvent : a player can be involved, either as a vehicle, or a passenger
    if (entities.player(event.vehicle)) {
        return [event.vehicle];
    }
    if (event.vehicle && entities.player(event.vehicle.passenger)) {
        return [event.vehicle.passenger];
    }
    // There is still some event that are uncovered here (for example, if a ProjectileLaunchEvent, a
    // player might be involved as the shooter of the new projectile). However, it's much too
    // tedious to check for every possible event. Let's admit we're out of luck
    return [];
};

// Return true if the frame contains function name : it needs to be a direct call by command
// (identified by methodName beeing <program>) and the function name need to have been identified.
// See /lib/scriptcraft.js:_eval to see how the function name is identified

var containsFunctionName = function(frame) {
    return (frame.methodName == "<program>" || frame.methodName == ":program") &&
           frame.fileName != "<repl>";
};

// Take a single frame, and return a pretty string
var prettifyFrame = function(frame) {
    var out = "";
    // Note : in a nashorn frame, methodName is more akin to a "location" : it can be either
    // <anonymous> (function defined inside a .js file), <program> (function called with /js),
    // and __FuncName$ (scriptcraft's internal, glue to nashorn)
    // If the exception is a java exception, in the javascript part of the exception, the syntax
    // is slightly different. In particular, <program> is :program

    if (containsFunctionName(frame)) {
        return "Function name : ".white() + frame.fileName.purple();
    }
    // We don't want to display the full path (too long, confusing), or only the filename (too
    // short, can't know if the issue is in your code or another So we'll go back 2 levels to
    // provide some context with as few confusion as possible
    var contextualPath = frame.fileName;
    var originalFile   = new File(contextualPath);
    if (originalFile.isFile()) {
        var file = originalFile;
        // Do it 3 times, because the first time is to get from the actual file to its folder
        for (var i = 0; i < 3; i++) {
            file = file.parentFile;
        }
        contextualPath = file.toPath().relativize(originalFile.toPath());
    }

    out += "in file ".white() + String(contextualPath).red() + " on line ".white() +
           String(frame.lineNumber).red();
    out += "\n".white();
    return out;
};

// Takes an exception and return a pretty string, removing scriptcraft's internal call stack
// We only keeps the lines which path is in allowedPaths
// This function is mainly used in classroom setting (hence allowedPaths default value)
// However you can pass an optional parameter allowedPaths if you want to override this (if you are
// debugging stuff in a module/plugin for example)
var prettifyException = function(exception, allowedPaths) {
    if (typeof exception === "undefined" || typeof exception.getStackTrace != "function") {
        console.warn("Called prettifyException without an exception");
        return;
    }
    if (typeof allowedPaths === "undefined") {
        allowedPaths = ["scriptcraft/players/", "minecraft/code"];
    }
    var out = "";

    // Pretty print the exception message itself
    var splitted = String(exception).split(":");
    // This should probably not append
    if (splitted.length < 2) {
        out += "Error: ".red() + String(exception).white() + "\n";
    } else {
        out += splitted[0].red() + ":".white() + splitted[1] + "\n";
    }

    // pretty print the stack now
    var frames = [];
    if (nashorn) {
        frames = utils.array(exception.getStackTrace());
    } else {
        console.log("prettifyException needs nashorn engine");
    }
    var firstFunction = true;
    frames.forEach(function(frame) {
        // Check if the frame is relevant
        var matching = false;
        allowedPaths.forEach(function(path) {
            if (frame.fileName.indexOf(path) != -1)
                matching = true;
        });
        if (matching) {
            out += firstFunction ? "" : "Called ".red();
            out += prettifyFrame(frame);
            firstFunction = false;
        }
        // Special case : always display this (it contains the function name called)
        if (containsFunctionName(frame)) {
            out += prettifyFrame(frame);
        }
    });
    return out;
};

// Make sure we are sending the message to a proper player
var handleException = function(exception, player) {
    if (entities.player(player)) {
        echo(player, prettifyException(exception));
    }
};


// Wrap an event callback with proper exception handling
// Use it like this :
// events.playerMove(eventWrapper(myHandler));
var eventWrapper = function(callback) {
    var wrapped = function() {
        try {
            callback.apply(this, arguments);
        } catch (exception) {
            // Try to send it to someone involved with the event
            var event     = arguments[0];
            var receivers = findReceivers(event, exception);
            // There is no one to listen - let's just send it to every player, someone's bound to
            // see the error
            if (!receivers) {
                receivers = utils.players();
            }
            receivers.forEach(function(r) { handleException(exception, r); });
        }
    };
    return wrapped;
};

// Wrap a function with proper exception handling
// Use it like this :
// exports.myFunc = functionWrapper(myFunc);
var functionWrapper = function(fn) {
    var wrapped = function() {
        try {
            fn.apply(this, arguments);
        } catch (exception) {
            var sender = self;
            handleException(exception, sender);
        }
    };
    return wrapped;
};


module.exports = {
    prettifyException: prettifyException,
    handleException: handleException,
    eventWrapper: eventWrapper,
    functionWrapper: functionWrapper,
};
