HTMLInspector.addRule("validate-elements", function(listener, reporter) {

  var validation = this.extensions.validation

  listener.on("element", function(name) {
    if (validation.isElementObsolete(name)) {
      reporter.addError(
        "validate-elements",
        "The <" + name + "> element is obsolete and should not be used.",
        this
      )
    }
    else if (!validation.isElementValid(name)) {
      reporter.addError(
        "validate-elements",
        "The <" + name + "> element is not a valid HTML element.",
        this
      )
    }
  })

})