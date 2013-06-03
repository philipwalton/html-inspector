describe("Rules", function() {

  var originalRules = HTMLInspector.rules
    , originalModules = HTMLInspector.modules

  afterEach(function() {
    HTMLInspector.rules = originalRules
    HTMLInspector.modules = originalModules
  })