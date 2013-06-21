HTMLInspector.rules.add(
  "unused-classes",
  {
    whitelist: [
      /^js\-/,
      /^supports\-/,
      /^language\-/,
      /^lang\-/
    ]
  },
  function(listener, reporter, config) {

    var css = HTMLInspector.modules.css
      , classes = css.getClassSelectors()
      , foundIn = this.utils.foundIn

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
    }
  )
})