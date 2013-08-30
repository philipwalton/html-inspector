// Safe to assume arguments here
var basePath = phantom.args[0]
  , inspectLocation = phantom.args[1]
  , configFile = phantom.args[2]

var system = require('system')
  , page = require('webpage').create()

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
    page.injectJs(basePath + '/dist/html-inspector.js')
  }

  page.injectJs(basePath + '/bin/phantom-bridge.js')

  page.evaluate(function() {
    HTMLInspector.defaults.onComplete = function(errors) {
      sendMessage('htmlinspector.complete', errors)
    }
  })

  if (configFile) {
    page.injectJs(configFile)
  } else {
    page.evaluate(function() {
      HTMLInspector.inspect()
    })
  }
  phantom.exit()
}

page.open(inspectLocation)
