module.exports = {

  name: "validate-elements",

  func: function(listener, reporter) {

    var validation = this.modules.validation

    listener.on("element", function(name) {
      if (validation.isElementObsolete(name)) {
        reporter.warn(
          "validate-elements",
          "The <" + name + "> element is obsolete and should not be used.",
          this
        )
      }
      else if (!validation.isElementValid(name)) {
        reporter.warn(
          "validate-elements",
          "The <" + name + "> element is not a valid HTML element.",
          this
        )
      }
    })
  }
}
