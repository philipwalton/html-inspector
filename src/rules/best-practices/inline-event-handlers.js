var foundIn = require("../../utils/string-matcher")

module.exports = {

  name: "inline-event-handlers",

  config: {
    whitelist: []
  },

  func: function(listener, reporter, config) {
    listener.on('attribute', function(name, value) {
      if (name.indexOf("on") === 0 && !foundIn(name, config.whitelist)) {
        reporter.warn(
          "inline-event-handlers",
          "An '" + name + "' attribute was found in the HTML. Use external scripts for event binding instead.",
          this
        )
      }
    })
  }
}
