
var fiberglass = require('fiberglass');

fiberglass.tasks.register(
  '<% if (!browser) {%>!browser-only<%}%>'
);
