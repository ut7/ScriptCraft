var Drone = require('drone');
var blocks = require('blocks');

exports.testDroneWithoutArgumentUsesSelfAsPlayer = function() {
  global.self = {name: 'joe', location:{ x:10, y:15, z:20 }};
  var drone = new Drone();
  assertEqual([10, 15, 23], [drone.x, drone.y, drone.z]);
};

exports.testDroneGivenAPlayerWithoutMouseNorDirectionTakesLocationFromPlayerAndAdds3ToZ = function() {
  var player = {name: 'joe', location:{ x:10, y:15, z:20 }};
  var drone = new Drone(player);
  assertEqual([10, 15, 23], [drone.x, drone.y, drone.z]);
};

exports.testDroneGivenAPlayerWithoutMouseLookingNorthTakesLocationFromPlayerAndSubtracts3FromZ = function() {
  var player = {name: 'joe', location:{ x:10, y:15, z:20, yaw: 180 }};
  var drone = new Drone(player);
  assertEqual([10, 15, 17], [drone.x, drone.y, drone.z]);
};

exports.testDroneGivenAPlayerLookingNorthCreatesRedstoneRepeaterFacingSouth = function() {
  var player = {name: 'joe', location: {yaw:180}};
  var drone = new Drone(player);
  var meta =  drone.getBlockIdAndMeta(blocks.redstone_repeater)[1];
  assertEqual(0, meta);
};

exports.testDroneGivenAPlayerLookingEastCreatesRedstoneRepeaterFacingWest = function() {
  var player = {name: 'joe', location: {yaw:90}};
  var drone = new Drone(player);
  var meta =  drone.getBlockIdAndMeta(blocks.redstone_repeater)[1];
  assertEqual(3, meta);
};

exports.testDroneGivenALocationStartsAtThatLocationEvenIfAPlayerIsAvailable = function() {
  global.self = {name: 'joe', location:{ x:10, y:15, z:20 }};
  var location = {x: 5, y: 6, z: 7, world: "hello", yaw: 0};
  var drone = new Drone(location);
  assertEqual([5, 6, 7], [drone.x, drone.y, drone.z]);
};
