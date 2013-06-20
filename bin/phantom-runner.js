// Safe to assume arguments here
var basePath = phantom.args[0],
  baseVersion = phantom.args[1],
  inspectLocation = phantom.args[2],
  configFile = phantom.args[3]

var injectVersions = {
  full: [''],
  core: ['.core'],
  convention: ['.core', '.convention'],
  'best-practices': ['.core', '.best-practices'],
  validation: ['.core', '.validation']
}

var page = require('webpage').create()

page.onConsoleMessage = function(msg) {
  console.log(msg)
}

page.onLoadFinished = function(status) {

  if(status !== 'success') {
    console.log('Unable to open', location)
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

  page.evaluate(function() {
    HTMLInspector.inspect()
  })
  phantom.exit()
}

page.open(inspectLocation)
