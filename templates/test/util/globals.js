
global.when = function(){
  var args = Array.prototype.slice.apply(arguments);
  args[0] = 'when ' + args[0];
  describe.apply(this, args);
};
global.expect = require('expect.js');
global.<%= camelName %> = (typeof window !== 'undefined' ? window.<%= camelName %> : null) ||
  require('../../' + 'src/main.js');
