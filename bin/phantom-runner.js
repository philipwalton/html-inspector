// Safe to assume arguments here
var basePath = phantom.args[0],
  baseVersion = phantom.args[1],
  inspectLocation = phantom.args[2],
  configFile = phantom.args[3];

var injectVersions = {
  full: [''],
  core: ['.core'],
  convention: ['.core', '.convention'],
  'best-practices': ['.core', '.best-practices'],
  validation: ['.core', '.validation']
};

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
    injectVersions[baseVersion].forEach(function(version) {
      page.injectJs(basePath + '/dist/html-inspector' + version + '.js');
    });
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
