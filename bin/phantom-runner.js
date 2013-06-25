// Safe to assume arguments here
var basePath = phantom.args[0],
  baseVersion = phantom.args[1],
  inspectLocation = phantom.args[2],
  configFile = phantom.args[3]

var system = require('system'),
  page = require('webpage').create()

var injectVersions = {
  full: [''],
  core: ['.core'],
  convention: ['.core', '.convention'],
  'best-practices': ['.core', '.best-practices'],
  validation: ['.core', '.validation']
}

page.onAlert = system.stdout.write

page.onLoadFinished = function(status) {

  if(status !== 'success') {
    system.stdout.write('Unable to open location "' + inspectLocation + '"')
    phantom.exit()
  }

  var hasInspectorScript = page.evaluate(function() {
    return 'HTMLInspector' in this
  })

  if(!hasInspectorScript) {
    injectVersions[baseVersion].forEach(function(version) {
      page.injectJs(basePath + '/dist/html-inspector' + version + '.js')
    })
  }

  if(configFile) {
    page.injectJs(configFile)
  }

  page.injectJs(basePath + '/bin/phantom-bridge.js')

  page.evaluate(function() {
    HTMLInspector.inspect({
      onComplete: function onComplete(errors) {
        sendMessage('htmlinspector.complete', errors)
      }
    })
  })
  phantom.exit()
}

page.open(inspectLocation)
