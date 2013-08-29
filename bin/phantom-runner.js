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

  if (configFile) {
    console.log(configFile)
    page.injectJs(configFile)
  } else {
    page.evaluate(function() {
      HTMLInspector.inspect({
        onComplete: function onComplete(errors) {
          sendMessage('htmlinspector.complete', errors)
        }
      })
    })
  }
  phantom.exit()
}

page.open(inspectLocation)
