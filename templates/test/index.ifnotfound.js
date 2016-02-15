/*
* mocha's bdd syntax is inspired in RSpec
*   please read: http://betterspecs.org/
*/
require('./util/globals');

describe('<%= camelName %>', function() {
  it('is an object', function() {
    expect(<%= camelName %>).to.be.an(Object);
  });
});
