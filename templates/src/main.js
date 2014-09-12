
// global exports

// exports.MyClass = require('my-class').MyClass;

<% if (browser) {%>
if (process.browser) {
  // exports only for browser bundle
  exports.version = '{{package-version}}';
  exports.homepage = '{{package-homepage}}';
} else {
  // exports only for node.js
  var packageInfo = require('../pack'+'age.json');
  exports.version = packageInfo.version;
  exports.homepage = packageInfo.homepage;
}
<%}else{%>
var packageInfo = require('../pack'+'age.json');
exports.version = packageInfo.version;
exports.homepage = packageInfo.homepage;
<%}%>
