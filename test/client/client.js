#!/usr/bin/env node

var util=require('util');
var mineflayer = require('mineflayer');

var bot = mineflayer.createBot({
	host: "localhost",
	port: 25565,
	username: "steve",
	password: null
});

bot.once('spawn', function () {
        bot.look(3.14,-.5)
	bot.chat('/js 1+1');

	bot.on('message', function(message) {
            if (util.format('%s', message) === "done with tests") {
              console.log("Tests are done, see server logs.");
              bot.quit();
	      process.exit(0);
            } else {
              console.log('got "' + message + '"\n');
            }
	});

});

function onServerEnd(reason) {
	process.stdout.write('\nConnection closed.\n');
	if (reason) {
		process.stdout.write(reason + '\n');
	}
	process.exit(0);
}

bot.on('kicked', function(reason) {
	process.stdout.write(reason + '\n');
});

bot.on('error', function(err) {
	onServerEnd(String(err));
});

// `end` is emitted before `kicked`! We wait a bit, in case a kick is coming right
// after that. If one doesn't, we'll exit anyway.
bot.on('end', function(reason) {
	setTimeout(onServerEnd.bind(null, reason), 100);
});

