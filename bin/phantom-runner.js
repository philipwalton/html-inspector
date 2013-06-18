// Safe to assume arguments here
var basePath = phantom.args[0],
  inspectLocation = phantom.args[1],
  configFile = phantom.args[2];

var page = require('webpage').create();

page.onConsoleMessage = function(msg) {
  console.log(msg);
};

page.onLoadFinished = function(status) {

  if(status !== 'success') {
    console.log('Unable to open', location);
    phantom.exit();
  }

  var hasDependencies = page.evaluate(function() {
    var deps = {};
    Array.prototype.forEach.call(arguments, function(dependency) {
      deps[dependency] = typeof this[dependency] !== 'undefined';
    });
    return deps;
  }, 'jQuery', 'HTMLInspector');

  if(!hasDependencies.jQuery) {
    page.injectJs(basePath + '/bower_components/jquery/jquery.js');
  }

  if(!hasDependencies.HTMLInspector) {
    page.injectJs(basePath + '/dist/html-inspector.js');
  }

  if(configFile) {
    page.injectJs(configFile);
  }

  page.evaluate(function() {
    HTMLInspector.inspect();
  });
  phantom.exit();
};

page.open(inspectLocation);
