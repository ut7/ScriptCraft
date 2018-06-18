// To run these tests:
// /js require('scedit/tests', false).runTests()

var scedit = require('./index', false);

var tests = {};

tests.createUrl = function(test) {
  var baseUrl = 'http://host.net/path',
      secret = 'chuut';

  var scedit_stubbed = Object.create(scedit);

  scedit_stubbed.createJwt = function(payload, secret) {
    return JSON.stringify(payload) + ' signed with ' + JSON.stringify(secret);
  };

  test.equal(
    scedit_stubbed.makeUrlFor("toto", baseUrl, secret),
    'http://host.net/path/{"login":"toto"} signed with "chuut"'
  );
};

tests.createJwt = function(test) {
  var token = scedit.createJwt({login: 'etienne'}, "rogerhanin");
  test.equal('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6ImV0aWVubmUifQ.Jg75p-wjeJAz3qOaCxlPV8HVUa_v3j4mbZvVOopoG-U', token);
};

exports.runTests = function() {
  var test = {
    equal: function(actual, expected) {
      if(expected !== actual) {
        throw new Error("Expected " + expected + ", got " + actual);
      }
    }
  };
  Object.keys(tests).forEach(function (name) {
    try {
      tests[name](test);
    } catch(e) {
      echo('Test ' + name + ' failed: ' + e.toString());
    }
  });
};
