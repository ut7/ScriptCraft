/* Send to the player special chat objects (containing links)
 * Taken from gnanclass/index.js (need to find a way to have it in one place and properly require
 * it)
 * */
function sendChat(player, chatObjects) {
    var json = JSON.stringify(chatObjects);
    if (__plugin.canary) {
        var Canary    = Packages.net.canarymod.Canary;
        var ccFactory = Canary.factory().getChatComponentFactory();
        var cc        = ccFactory.deserialize(json);
        player["message(ChatComponent[])"](cc);
    } else {
        var ComponentSerializer = Packages.net.md_5.bungee.chat.ComponentSerializer;
        var cc                  = ComponentSerializer.parse(json);
        player.spigot().sendMessage(cc);
    }
}


/* Return a list of callpath for function contained inside obj
 * For example, if module contains 'foo', 'bar', return ['foo', 'bar']
 * if recursive if true, this will also parse the module submodule (objects)
 * e.g {foo: {baz : function(){}, name: 'foo.bar'}, bar: function(){}} will return
 * ['bar', 'foo.baz']
 * */
var findFunctions = function(module, recursive) {
    if (typeof recursive === "undefined")
        recursive = false;
    var out = [];
    for (var property in module) {
        if (!module.hasOwnProperty(property))
            continue;
        var callPath = "";
        if (typeof module[property] === "function") {
            callPath = property;
            out.push(callPath);
        }
        if (recursive && typeof module[property] === "object") {
            var child = findFunctions(module[property], recursive);
            if (child.length === 0)
                continue;
            // Don't forget to prepend child functions with the object's name
            for (var i = 0; i < child.length; i++) {
                callPath = property + "." + child[i];
                out.push(callPath);
            }
        }
    }
    return out;
};

/* Return a chat event, with a link named 'displayName' which will execute callPath on click (as a
 * js function, so prepend with /js, append with ()). args is optional ; if supplied, it should be
 * an array of args which will be added to the callStr
 */

var executableLink = function(displayName, color, callPath, args) {
    var callStr = "";
    if (typeof args !== undefined && args.length > 0) {
        // We can't use directly args.join() because :
        // For String, since we are generating a JS-valid line, we need to add quotes around the
        // String value And also, we need to make sure we don't have quotes inside the value
        var fixedArgs = [];
        args.forEach(function(a) {
            if (typeof a === "string") {
                fixedArgs.push("\"" + a.replace("\"", "\'") + "\"");
            } else {
                fixedArgs.push(String(a));
            }
        });
        var argCall = fixedArgs.join(", ");
        callStr     = "/js " + callPath + "(" + argCall + ")";
    } else {
        callStr = "/js " + callPath + "()";
    }
    var out = {
        text: displayName,
        clickEvent: {action: "run_command", value: callStr},
        color: color
    };
    return out;
};

var displayPlayerFunctions = function(player) {
    if (!player) {
        console.warn("displayPlayerFunctions called without a player, should not happen");
        return;
    }
    var funcs = findFunctions(global[player.name], true);
    var chat  = [];
    for (var i = 0; i < funcs.length; i++) {
        var fName       = funcs[i];
        var displayName = fName;
        var args        = [];
        var callPath    = player.name + "." + fName;
        var color       = i % 2 === 0 && "blue" || "light_purple";
        var link        = executableLink(displayName, color, callPath, args);
        chat.push(link);
        // nice formatting : two links per line, with padding between them to simulate a table
        if (i !== 0 && (i % 2 == 1)) {
            chat.push({text: "\n"});
        } else {
            var padLength = 40 - displayName.length;
            var padding   = "";
            for (var j = 0; j < padLength; j++) {
                padding += " ";
            }
            chat.push({text: padding});
        }
    }
    sendChat(player, chat);
};


module.exports = {
    findFunctions: findFunctions,
    executableLink: executableLink,
    displayPlayerFunctions: displayPlayerFunctions,
    sendChat: sendChat,
};
