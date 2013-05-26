HTMLInspector.addRule("nonsemantic-elements", function(listener, reporter) {

  listener.on('element', function(name) {
    var isUnsemantic = name == "div" || name == "span"
      , isAttributed = this.attributes.length === 0
    if (isUnsemantic && isAttributed) {
      reporter.addError(
        "nonsemantic-elements",
        "Do not use <div> or <span> elements without any attributes",
        this
      )
    }
  })

})