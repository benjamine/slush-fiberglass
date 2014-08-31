
// global exports

// exports.MyClass = require('my-class').MyClass;

<% if (browser) {%>
// detect runtime
var inNode = typeof process !== 'undefined' && typeof process.execPath === 'string';
if (inNode) {
  // exports only for node.js
  var packageInfo = require('../package' + '.json');
  exports.version = packageInfo.version;
  exports.homepage = packageInfo.homepage;
} else {
  // exports only for browser bundle
	exports.homepage = '{{package-homepage}}';
	exports.version = '{{package-version}}';
}
<%}else{%>
var packageInfo = require('../package' + '.json');
exports.version = packageInfo.version;
exports.homepage = packageInfo.homepage;
<%}%>
