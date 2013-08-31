// Safe to assume arguments here
var basePath = phantom.args[0]
  , inspectLocation = phantom.args[1]
  , configFile = phantom.args[2]

var system = require('system')
  , page = require('webpage').create()

page.onCallback = function(data) {
  if (data && data.sender && data.sender == "HTMLInspector") {
    console.log(data.message)
  }
}

page.onClosing = function() {
  phantom.exit()
}

page.onError = function(msg) {
  console.error(msg)
  phantom.exit()
}

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
      window.callPhantom({
        sender: "HTMLInspector",
        message: errors.map(function(error) {
          return "[" + error.rule + "] " + error.message
        }).join("\n")
      })
      window.close()
    }
  })

  if (configFile) {
    page.injectJs(configFile)
  } else {
    page.evaluate(function() {
      HTMLInspector.inspect()
    })
  }
}

page.open(inspectLocation)
