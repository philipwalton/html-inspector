module.exports = {

  name: "unused-classes",

  config: {
    whitelist: [
      /^js\-/,
      /^supports\-/,
      /^language\-/,
      /^lang\-/
    ]
  },

  func: function(listener, reporter, config) {

    var classes = this.modules.css.getClassSelectors()
      , foundIn = require("../../utils/string-matcher")

    listener.on("class", function(name) {
      if (!foundIn(name, config.whitelist) && classes.indexOf(name) < 0) {
        reporter.warn(
          "unused-classes",
          "The class '"
          + name
          + "' is used in the HTML but not found in any stylesheet.",
          this
        )
      }
    })
  }
}
