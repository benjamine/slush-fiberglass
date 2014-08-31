
var gutil = require('gulp-util');
var through = require('through2');
var path = require('path');
var fs = require('fs');
var jsonCombine = require('./json-combine');
var PLUGIN_NAME = 'gulp-jsoncombine';

function gulpJsonCombine(targetPath) {

  if (!targetPath) {
    throw new gutil.PluginError(PLUGIN_NAME, "Missing target path!");
  }

  // Creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, callback) {

    if (!/\.combine\.json$/.test(file.relative)) {
      // make sure the file goes through the next gulp plugin
      this.push(file);
      return callback();
    }
    targetFile = path.join(targetPath, file.relative).replace('.combine.json', '.json');
    if (!fs.existsSync(targetFile)) {
      return callback();
    }

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return callback();
    }

    if (file.isBuffer()) {
      var json = JSON.parse(fs.readFileSync(targetFile).toString());
      var changed = jsonCombine(
        json,
        JSON.parse(file.contents.toString())
      );
      if (!changed) {
        return callback();
      }
      file.contents = new Buffer(JSON.stringify(json, null, 2));
      file.path = file.path.replace('.combine.json', '.json');
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);
    // tell the stream engine that we are done with this file
    callback();
  });

  // returning the file stream
  return stream;
}


module.exports = gulpJsonCombine;
