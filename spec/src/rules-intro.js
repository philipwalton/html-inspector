describe("Rules", function() {

  var originalConfig = HTMLInspector.config

  function setupSandbox(html) {
    return  $("#html-inspector-sandbox").html(html)
  }

  beforeEach(function() {
    HTMLInspector.config.styleSheets = $("link:not([href*='jasmine'])")
    $('<div id="html-inspector-sandbox"></div>').appendTo("body")
  })

  afterEach(function() {
    HTMLInspector.config = originalConfig
    $("#html-inspector-sandbox").remove()
  })
