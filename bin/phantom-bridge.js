/*global alert:true, HTMLInspector:true*/

// Send messages to the parent PhantomJS process via alert
function _parseErrors(errors) {
  var results = [],
    i = 0,
    len;

  for (len = errors.length; i < len; i++) {
    results[i] = {
      rule: errors[i].rule,
      message: errors[i].message
    };
  }

  return results;
}

function sendMessage() {
  var args = [].slice.call(arguments),
    msg = args[0];

  if (msg === 'htmlinspector.complete') {
    alert(JSON.stringify(_parseErrors(args[1])));
  }
}
