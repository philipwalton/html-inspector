HTMLInspector.rules.add("scoped-styles", function(listener, reporter) {

  var elements = []

  listener.on("element", function(name) {
    var isOutsideHead
      , isScoped
    if (name == "style") {
      isOutsideHead = !$(this).closest("head").length
      isScoped = $(this).attr("scoped") != null
      if (isOutsideHead && !isScoped) {
        reporter.addError(
          "scoped-styles",
          "<style> elements outside of <head> must declare the 'scoped' attribute.",
          this
        )
      }
    }
  })

})