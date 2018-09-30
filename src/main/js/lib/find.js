'use strict';
var File = java.io.File;
module.exports = function find(dir, filter) {
  var result = [];
  function recurse(dirfile, store) {
    var files,
      len,
      i,
      file;

    if (typeof filter == 'undefined') {
      files = dirfile.list();
    } else {
      files = dirfile.list(filter);
    }
    len = files.length;
    i = 0;
    for (; i < len; i++) {
      file = new File(dirfile, files[i]);
      if (file.isDirectory()) {
        recurse(file, store);
      } else {
        store.push(('' + file.canonicalPath).replace(/\\\\/g, '/'));
      }
    }
  }
  var dirfile = dir instanceof File ? dir : new File(dir);
  recurse(dirfile, result);
  return result;
};
