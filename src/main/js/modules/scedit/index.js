var baseUrl = Packages.java.lang.System.getenv('IDE_URL');
var secret  = Packages.java.lang.System.getenv('SECRET');

var jwt = require('jwt');

var scedit = {};

scedit.makeUrlFor = function(login, base, secret) {
  var url = base;
  if (base.slice(-1) != '/') {
    url += '/';
  }
  return url + this.createJwt({login: login}, secret);
}

scedit.getUrlFor = function(login) {
  return this.makeUrlFor(login, baseUrl, secret);
}

scedit.enabled = function() {
  return (!! baseUrl && !! secret);
}

scedit.createJwt = jwt.jwt;

module.exports = scedit;
