var global = this;

var logger = {
  info: function(message) {
    java.lang.System.out.println('[INFO] ' + message);
  },
  debug: function(message) {
    //java.lang.System.out.println('[DEBUG] ' + message);
  }
};

(function() {
  var FileReader = java.io.FileReader;
  var configRequire = engine.eval(new FileReader("src/main/js/lib/require.js"));
  var requireHooks = {
    loading: function( path ) {
      logger.debug( 'loading ' + path );
    },
    loaded: function( path ) {
      logger.debug( 'loaded  ' + path );
    }
  };

  var nashorn = typeof Java != 'undefined';

  global.nashorn = nashorn;

  var evaluator = function(code, filename) {
    return load({ script: code, name: filename });
  };

  global.require = configRequire("src/main/js",
      ["src/main/js/lib/", "src/main/js/modules/"],
      requireHooks, [evaluator]);

  global.console = {
    log: logger.info,
  };

  global.scload = function(file) {
    var buffered = new java.io.BufferedReader(new FileReader(file));
    var code = '';
    try {
      while ( (line = buffered.readLine()) !== null ) {
        code += line + '\n';
      }
    }
    finally {
      buffered.close();
    }
    return engine.eval('(' + code + ')');
  }

  global.__plugin = {
    bukkit: true
  };

  global.setTimeout = function() {
    logger.debug("ignoring setTimeout");
  };

  global.addUnloadHandler = function() {
    logger.debug("ignoring addUnloadHandler");
  };

  function consoleLog() {
    var args = [].slice.call(arguments);
    if ( args.length > 1 ) {
      logger.info(java.lang.String.format(args[0], args.slice(1)));
    } else {
      logger.info(args[0]);
    }
  }

  global.console = {
    log: function(){},
    info: function(){},
    warn: consoleLog,
    error: consoleLog,
  };
}());

function assertEqual(expected, actual) {
  expected = JSON.stringify(expected);
  actual = JSON.stringify(actual);
  if (actual !== expected) {
    throw new Error("Expected " + expected + ", got " + actual + " instead.");
  }
}

function runTests() {
  var testsRun = 0;

  function execute_test(test) {
    var testName = test.name;
    logger.info(testName);
    testsRun++;
    try {
      test();
      return true;
    } catch(e) {
      java.lang.System.err.println("Test '" + testName + "' failed!");
      java.lang.System.err.println(e.stack);
      return false;
    }
  }

  var tests = Object.keys(global).filter(function(name){
    return /^test/.test(name);
  }).map(function(name) {
    return global[name];
  });

  var success = tests.map(execute_test).every(function(r){return r;});

  java.lang.System.out.println(testsRun + " tests run.");

  java.lang.System.exit(success ? 0 : 1);
}

var Drone = require("src/main/js/modules/drone/index.js");

function testDroneGivenAPlayerWithoutMouseNorDirectionTakesLocationFromPlayerAndAdds3ToZ() {
  var player = {name: 'joe', location:{ x:10, y:15, z:20 }};
  var drone = new Drone(player);
  assertEqual([10, 15, 23], [drone.x, drone.y, drone.z]);
}

function testDroneGivenAPlayerWithoutMouseLookingNorthTakesLocationFromPlayerAndSubtracts3FromZ() {
  var player = {name: 'joe', location:{ x:10, y:15, z:20, yaw: 180 }};
  var drone = new Drone(player);
  assertEqual([10, 15, 17], [drone.x, drone.y, drone.z]);
}

runTests();
