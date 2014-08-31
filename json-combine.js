function combine(leftObject, rightObject) {
  var changes = false;
  for (var name in rightObject) {
    var left = leftObject[name];
    var right = rightObject[name];
    if (typeof left === 'undefined') {
      changes = true;
      leftObject[name] = right;
    } else if (typeof left === 'object' && typeof right === 'object'){
      if (combine(left, right)) {
        changes = true;
      }
    } else if (left !== right) {
      changes = true;
      leftObject[name] = right;
    }
  }
  return changes;
}

module.exports = combine;
