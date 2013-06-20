HTMLInspector.rules.add("validate-attributes", function(listener, reporter) {

  var validation = HTMLInspector.modules.validation

  listener.on("element", function(name) {
    var required = validation.getRequiredAttributesForElement(name)
    required.forEach(function(attr) {
      if (!this.hasAttribute(attr)) {
        reporter.warn(
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

    // don't validate the attributes of invalid elements
    if (!validation.isElementValid(element)) return

    if (validation.isAttributeObsoleteForElement(name, element)) {
      reporter.warn(
        "validate-attributes",
        "The '" + name + "' attribute is no longer valid on the <"
        + element + "> element and should not be used.",
        this
      )
    }
    else if (!validation.isAttributeValidForElement(name, element)) {
      reporter.warn(
        "validate-attributes",
        "'" + name + "' is not a valid attribute of the <"
        + element + "> element.",
        this
      )
    }
  })

})