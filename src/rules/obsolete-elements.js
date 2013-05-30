HTMLInspector.addRule("obsolete-elements", function(listener, reporter) {

  // http://www.w3.org/TR/html5-diff/#obsolete-elements
  var obsoluteElements = [
    "basefont",
    "big",
    "center",
    "font",
    "strike",
    "tt",
    "frame",
    "frameset",
    "noframes",
    "acronym",
    "applet",
    "isindex",
    "dir"
  ]

  listener.on("element", function(name) {
    if (obsoluteElements.indexOf(name) >= 0) {
      reporter.addError(
        "obsolete-elements",
        "The '" + name + "' element is obsolete and should not be used.",
        this
      )
    }
  })

})