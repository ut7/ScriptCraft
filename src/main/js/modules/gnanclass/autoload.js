// Ugly copy from plugin.js to add error notifications
module.exports = function ( context, pluginDir, errorCallback ) {
  var _canonize = function( file ) { 
    return '' + file.canonicalPath.replaceAll('\\\\','/'); 
  };

  /*
   recursively walk the given directory and return a list of all .js files 
   */
  var _listSourceFiles = function( store, dir ) {
    var files = dir.listFiles(),
      file;
    if ( !files ) {
      return;
    }
    for ( var i = 0; i < files.length; i++ ) {
      file = files[i];
      if ( file.isDirectory( ) ) {
        _listSourceFiles( store, file );
      }else{
        if ( file.canonicalPath.endsWith( '.js' ) ) {
          store.push( file );
        }
      }
    }
  };

  /*
   Reload all of the .js files in the given directory 
   */
  (function(pluginDir) {
    var sourceFiles = [],
        property,
        module,
        pluginPath,
        indexFile = new java.io.File(pluginDir, 'index.js');

    if (indexFile.isFile()) {
      sourceFiles = [indexFile];

      if (config && config.verbose) {
        console.info('index file found in ' + pluginDir);
      }
    } else {
      _listSourceFiles(sourceFiles, pluginDir);

      if (config && config.verbose) {
        console.info(sourceFiles.length + ' scriptcraft plugins found in ' + pluginDir);
      }
    }

    sourceFiles.forEach(function(file) {
      pluginPath = _canonize(file);
      module = null;

      try {
        module = require(pluginPath, { cache: false });
        for (property in module) {
          /* all exports in plugins become members of context object */
          context[property] = module[property];
        }
      } catch (e) {
        console.error(e);
        try {
          errorCallback(e);
        } catch(e) {}
      }
    });
  }(pluginDir));
};
