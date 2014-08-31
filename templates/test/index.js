/*
* mocha's bdd syntax is inspired in RSpec
*   please read: http://betterspecs.org/
*/
require('./util/globals');

describe('<%= camelName %>', function(){
  before(function(){
  });
  it('has a semver version', function(){
    expect(<%= camelName %>.version).to.match(/^\d+\.\d+\.\d+(-.*)?$/);
  });
});
