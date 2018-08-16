function inventory(entity) {
  var inv = entity.inventory;
  var result = {
    add: function(items) {
      inv.addItem(items);
      return result;
    },
    remove: function(items) {
      inv.removeItem(items);
      return result;
    },
    contains: function(items) {
      return inv.contains(items);
    }
  };
  return result;
}
module.exports = inventory;
