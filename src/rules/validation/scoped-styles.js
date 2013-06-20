HTMLInspector.rules.add("scoped-styles", function(listener, reporter) {

  var elements = []

  listener.on("element", function(name) {
    var isOutsideHead
      , isNotScoped
    if (name == "style") {
      isOutsideHead = !matches(document.querySelector("head"), parents(this))
      isNotScoped = !this.hasAttribute("scoped")
      if (isOutsideHead && isNotScoped) {
        reporter.warn(
          "scoped-styles",
          "<style> elements outside of <head> must declare the 'scoped' attribute.",
          this
        )
      }
    }
  })

})