var _ = require('lodash');
var gutil = require('gulp-util');
var through = require('through2');
var path = require('path');
var fs = require('fs');
var PLUGIN_NAME = 'gulp-patch';

var util = {};

function gulpPatch(targetPath, data) {
  if (!targetPath) {
    throw new gutil.PluginError(PLUGIN_NAME, 'Missing target path!');
  }

  // Creating a stream through which each file will pass
  var stream = through.obj(function(file, enc, callback) {
    if (!/\.patch\.js$/.test(file.relative)) {
      // make sure the file goes through the next gulp plugin
      this.push(file);
      return callback();
    }
    var targetFile = path.join(targetPath, file.relative).replace(/\.patch\.js$/i, '');

    if (file.isStream()) {
      this.emit('error', new gutil.PluginError(PLUGIN_NAME, 'Streams are not supported!'));
      return callback();
    }

    if (file.isBuffer()) {
      var current;
      if (fs.existsSync(targetFile)) {
        current = fs.readFileSync(targetFile).toString();
      }
      var patch = require('./templates/' + file.relative);
      var patched = patch(current, util, data);
      if (patched === undefined) {
        return callback();
      }
      file.contents = new Buffer(patched);
      file.path = file.path.replace(/\.patch\.js$/i, '');
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);
    // tell the stream engine that we are done with this file
    callback();
  });

  // returning the file stream
  return stream;
}

util.json = {
  patch: function(currentJson, defaults, override) {
    var current = JSON.parse(currentJson || '{}');
    var output = {};
    if (defaults) {
      _.merge(output, defaults);
    }
    _.merge(output, current);
    if (override) {
      _.merge(output, override);
    }
    return JSON.stringify(output, null, 2);
  }
};

var versionRegex = /(\d+)\.(\d+|x)\.(\d+|x)/i;
function versionHigherThan(a, b) {
  if (a === b) {
    return false;
  }
  if (a === 'latest') {
    return true;
  }
  var aParts = versionRegex.exec(a);
  var bParts = versionRegex.exec(b);
  if (!bParts || !aParts) {
    return false;
  }
  function versionPartToNumber(part) {
    if (/\d+/.test(part)) {
      return parseInt(part);
    }
    return 0;
  }
  for (var i = 0; i < 3; i++) {
    if (versionPartToNumber(aParts[i]) > versionPartToNumber(bParts[i])) {
      return true;
    }
  }
  return false;
}

function higherDeps(baseDeps, newDeps) {
  var higherDeps = {};
  Object.keys(newDeps).forEach(function(name) {
    if (!baseDeps[name] || versionHigherThan(newDeps[name], baseDeps[name])) {
      higherDeps[name] = newDeps[name];
    }
  });
  return higherDeps;
}

util.packageJson = {
  patch: function(currentJson, defaults, override) {
    if (currentJson && override) {
      var current = JSON.parse(currentJson);
      for (var name in override) {
        if (current[name] && override[name] && /dependencies$/i.test(name)) {
          override[name] = higherDeps(current[name], override[name]);
        }
      }
    }
    return util.json.patch.apply(this, arguments);
  }
};

module.exports = gulpPatch;
