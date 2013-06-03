HTMLInspector.addRule("validate-attributes", function(listener, reporter) {

  var validation = HTMLInspector.modules.validation

  listener.on("element", function(name) {
    var required = validation.getRequiredAttributesForElement(name)
    required.forEach(function(attr) {
      if ($(this).attr(attr) == null) {
        reporter.addError(
          "validate-attributes",
          "The '" + attr + "' attribute is required for <"
          + name + "> elements.",
          this
        )
      }
    }, this)
  })

  listener.on("attribute", function(name) {
    var element = this.nodeName.toLowerCase()
    if (validation.isAttributeObsoleteForElement(name, element)) {
      reporter.addError(
        "validate-attributes",
        "The '" + name + "' attribute is no longer valid on the <"
        + element + "> element and should not be used.",
        this
      )
    }
    else if (!validation.isAttributeValidForElement(name, element)) {
      reporter.addError(
        "validate-attributes",
        "'" + name + "' is not a valid attribute of the <"
        + element + "> element.",
        this
      )
    }
  })

})