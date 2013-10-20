var foundIn = require("../../utils/string-matcher")

module.exports = {

  name: "validate-elements",

  config: {
    whitelist: []
  },

  func: function(listener, reporter, config) {

    var validation = this.modules.validation

    listener.on("element", function(name) {

      // ignore whitelisted elements
      if (foundIn(name, config.whitelist)) return

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
