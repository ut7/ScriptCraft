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
    if (nashorn) {
      return load({ script: code, name: filename });
    } else {
      return engine.eval(code);
    }
  };

  global.require = configRequire("src/main/js",
      ["src/main/js/lib/", "src/main/js/modules/"],
      requireHooks, evaluator);

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
}());

function assertEqual(expected, actual) {
  expected = JSON.stringify(expected);
  actual = JSON.stringify(actual);
  if (actual !== expected) {
    throw new Error("Expected " + expected + ", got " + actual + " instead.");
  }
}

function runTests(testModule) {
  var testsRun = 0;

  function execute_test(test) {
    var testName = test.name;
    logger.info(testName);
    testsRun++;
    try {
      global.self = undefined;
      test.fn();
      return true;
    } catch(e) {
      java.lang.System.err.println("Test '" + testName + "' failed!");
      java.lang.System.err.println(e.stack);
      return false;
    }
  }

  var tests = Object.keys(testModule).filter(function(name){
    return /^test/.test(name);
  }).map(function(name) {
    return {name: name, fn: testModule[name]};
  });

  var success = tests.map(execute_test).every(function(r){return r;});

  logger.info(testsRun + " tests run.");

  java.lang.System.exit(success ? 0 : 1);
}

runTests(require('src/test/js/drone_tests.js'));
