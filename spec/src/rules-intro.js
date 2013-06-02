describe("Rules", function() {

  var originalRules = HTMLInspector.rules
    , originalExtensions = HTMLInspector.extensions

  afterEach(function() {
    HTMLInspector.rules = originalRules
    HTMLInspector.extensions = originalExtensions
  })