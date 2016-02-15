var gutil = require('gulp-util');
var through = require('through2');
var path = require('path');
var fs = require('fs');
var PLUGIN_NAME = 'gulp-ifnotfound';

function gulpIfNotFound(targetPath) {
  if (!targetPath) {
    throw new gutil.PluginError(PLUGIN_NAME, 'Missing target path!');
  }

  function log(status, action, file, reason) {
    gutil.log('[' + gutil.colors.cyan(status) + ']', action,
      gutil.colors.magenta(file), '(' + reason + ')');
  }

  // Creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, callback) {
    var regex = /\.ifnotfound/i;
    if (!regex.test(file.relative)) {
      // make sure the file goes through the next gulp plugin
      this.push(file);
      return callback();
    }
    var targetFile = path.join(targetPath, file.relative).replace(regex, '');
    if (fs.existsSync(targetFile)) {
      // it is found, so ignore this file
      log('ifnfound', 'Skipping', targetFile, 'found');
      return callback();
    }

    file.path = file.path.replace(regex, '');

    // make sure the file goes through the next gulp plugin
    this.push(file);
    // tell the stream engine that we are done with this file
    callback();
  });

  // returning the file stream
  return stream;
}

module.exports = gulpIfNotFound;
