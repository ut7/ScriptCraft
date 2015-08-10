function runTestsWithPlayer(player) {
  global.self = player;
  drone = box(1);
  drone.then(function() {
    if (drone.getBlock().type.id === 1) {
      log('PASS')
    } else {
      log('FAIL')
    }
    echo(player,'done with tests');
  });
}

events.playerCommand(function(event) {
  runTestsWithPlayer(event.player);
});

function log(message) {
  __plugin.logman.info(message);
}

